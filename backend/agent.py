import os
import dotenv
import re
import yt_dlp
import json
import logging
from pytube import Search
from youtube_transcript_api import YouTubeTranscriptApi
from typing import List, Dict
from langchain_core.runnables import RunnableLambda
from langchain_core.messages import HumanMessage, ToolMessage
from langchain.chat_models import init_chat_model
from langchain_core.tools import tool

dotenv.load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

pytube_logger = logging.getLogger('pytube')
pytube_logger.setLevel(logging.ERROR)
yt_dpl_logger = logging.getLogger('yt_dlp')

llm = init_chat_model("gpt-5", model_provider="openai")

@tool
def extract_video_id(url: str) -> str:
    """
    Extrait l'identifiant vidéo YouTube de 11 caractères à partir d'une URL.

    Args:
        url (str): Une URL YouTube contenant un identifiant vidéo.

    Retourne :
        str : L'identifiant vidéo extrait ou un message d'erreur si l'analyse échoue.
    """

    # Regex pattern to match video IDs
    pattern = r'(?:v=|be/|embed/)([a-zA-Z0-9_-]{11})'
    match = re.search(pattern, url)
    return match.group(1) if match else "Error: Invalid YouTube URL"

@tool
def fetch_transcript(video_id: str, language: str = "fr") -> str:
    """
    Récupère la transcription d'une vidéo YouTube.

    Args:
        video_id (str): L'identifiant de la vidéo YouTube (ex : "dQw4w9WgXcQ").
        language (str): Code langue pour la transcription (ex : "fr", "en").

    Retourne :
        str : Le texte de la transcription ou un message d'erreur.
    """

    try:
        ytt_api = YouTubeTranscriptApi()
        transcript = ytt_api.fetch(video_id, languages=[language])
        return " ".join([snippet.text for snippet in transcript.snippets])
    except Exception as e:
        return f"Error: {str(e)}"

@tool
def search_youtube(query: str) -> List[Dict[str, str]]:
    """
    Recherche des vidéos YouTube correspondant à la requête.

    Args:
        query (str): Le terme de recherche à utiliser sur YouTube

    Retourne :
        Liste de dictionnaires contenant les titres et IDs des vidéos au format :
        [{'title': 'Titre de la vidéo', 'video_id': 'abc123'}, ...]
        Retourne un message d'erreur si la recherche échoue
    """
    try:
        s = Search(query)
        return [
            {
                "title": yt.title,
                "video_id": yt.video_id,
                "url": f"https://youtu.be/{yt.video_id}"
            }
            for yt in s.results
        ]
    except Exception as e:
        return f"Error: {str(e)}"

@tool
def get_full_metadata(url: str) -> dict:
    """Extrait les métadonnées d'une URL YouTube, incluant le titre, les vues, la durée, la chaîne, les likes, les commentaires et les chapitres."""
    with yt_dlp.YoutubeDL({'quiet': True, 'logger': yt_dpl_logger}) as ydl:
        info = ydl.extract_info(url, download=False)
        return {
            'title': info.get('title'),
            'views': info.get('view_count'),
            'duration': info.get('duration'),
            'channel': info.get('uploader'),
            'likes': info.get('like_count'),
            'comments': info.get('comment_count'),
            'chapters': info.get('chapters', [])
        }

@tool
def get_thumbnail(url: str) -> List[Dict]:
    """
    Récupère la miniatures disponible pour une vidéo YouTube à partir de son URL.

    Args:
        url (str): URL de la vidéo YouTube (n'importe quel format)

    Retourne :
        Liste de dictionnaires avec les URLs des miniatures et leur résolution dans l'ordre natif de YouTube
    """

    try:
        with yt_dlp.YoutubeDL({'quiet': True, 'logger': yt_dpl_logger}) as ydl:
            info = ydl.extract_info(url, download=False)

            thumbnails = []
            for t in info.get('thumbnails', []):
                if 'url' in t:
                    thumbnails.append({
                        "url": t['url'],
                        "width": t.get('width'),
                        "height": t.get('height'),
                        "resolution": f"{t.get('width', '')}x{t.get('height', '')}".strip('x')
                    })

            return thumbnails

    except Exception as e:
        return [{"error": f"Echec à obtenir les thumbnails: {str(e)}"}]

tools = [get_thumbnail, extract_video_id, fetch_transcript, search_youtube, get_full_metadata]
llm_with_tools = llm.bind_tools(tools)
tool_mapping = {
    "get_thumbnail" : get_thumbnail,
    "extract_video_id": extract_video_id,
    "fetch_transcript": fetch_transcript,
    "search_youtube": search_youtube,
    "get_full_metadata": get_full_metadata
}

def execute_tool(tool_call):
    """Exécute un appel d'outil unique et retourne ToolMessage"""
    try:
        result = tool_mapping[tool_call["name"]].invoke(tool_call["args"])
        content = json.dumps(result) if isinstance(result, (dict, list)) else str(result)
    except Exception as e:
        content = f"Error: {str(e)}"

    return ToolMessage(
        content=content,
        tool_call_id=tool_call["id"]
    )

def process_tool_calls(messages):
    """Traitement récursif des appels d'outil"""
    last_message = messages[-1]

    # Exécute tous les appels d'outil en parallèle
    tool_messages = [
        execute_tool(tc)
        for tc in getattr(last_message, 'tool_calls', [])
    ]

    # Ajoute les réponses des outils à l'historique des messages
    updated_messages = messages + tool_messages

    # Obtenir la réponse suivante de l'LLM
    next_ai_response = llm_with_tools.invoke(updated_messages)

    return updated_messages + [next_ai_response]

def should_continue(messages):
    """Vérifie si vous avez besoin d'une autre itération"""
    last_message = messages[-1]
    return bool(getattr(last_message, 'tool_calls', None))

def _recursive_chain(messages):
    """Traitement récursif des appels d'outil jusqu'à la fin"""
    if should_continue(messages):
        new_messages = process_tool_calls(messages)
        return _recursive_chain(new_messages)
    return messages

recursive_chain = RunnableLambda(_recursive_chain)

universal_chain = (
    RunnableLambda(lambda x: [HumanMessage(content=x["query"])])
    | RunnableLambda(lambda messages: messages + [llm_with_tools.invoke(messages)])
    | recursive_chain
)