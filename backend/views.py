import json
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .agent import extract_video_id, get_thumbnail, get_full_metadata, fetch_transcript, llm_with_tools
from langchain_core.messages import HumanMessage

@csrf_exempt
@require_http_methods(["GET"])
def index(request):
    return render(request, 'frontend/dist/index.html')

@csrf_exempt
@require_http_methods(["POST"])
def generate(request):
    data = json.loads(request.body)
    url = data.get('url')

    try:
        # Extraire le videoId de l'URL
        videoId = extract_video_id.run(url)
        print(f"URL: {url}")
        print(f"VideoID: {videoId}")

        # Récupérer les métadonnées et la transcription
        video_thumbnail = get_thumbnail.run(url)
        video_metadata = get_full_metadata.run(url)
        transcript = fetch_transcript.run(videoId)

        # Créer le prompt pour l'analyse
        prompt = f"""
        Analyse cette vidéo YouTube et fournis un résumé complet en français.

        TITRE DE LA VIDÉO : {video_metadata.get('title', 'N/A')}
        CHAÎNE : {video_metadata.get('channel', 'N/A')}
        VUES : {video_metadata.get('views', 'N/A')}
        DURÉE : {video_metadata.get('duration', 'N/A')} secondes
        LIKES : {video_metadata.get('likes', 'N/A')}

        TRANSCRIPTION :
        {transcript[:2000]}...

        À partir de ces informations, fournis :
        1. Un résumé concis du contenu (3-5 points clés)
        2. Les principaux sujets abordés
        3. Le public cible
        4. Une analyse de la qualité du contenu

        Important :
        - Utilise le format markdown pour la réponse (c'est à dire avec des h2, h3, des strong, et des bulelts points)
        - Dans ton analyse cependant n'affiches pas les metadata (vues, likes, commentaires)
        """

        # Exécuter l'agent avec le prompt
        messages = [HumanMessage(content=prompt)]
        response = llm_with_tools.invoke(messages)

        print(f"Analyse de la vidéo: {response.content}")

        return JsonResponse({
            "analysis": response.content,
            "thumbnail": video_thumbnail,
            "metadata": video_metadata
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

