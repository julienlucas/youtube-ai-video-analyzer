Ajoutez une étoile au repo pour soutenir mon travail. 🙏

![En-tête de l'analyseur de style de mode](header.png)

# Analyseur de vidéos YouTube pour créateurs

Une application d'IA qui analyse les vidéos YouTube et génère des rapports détaillés pour aider les créateurs à comprendre pourquoi leurs vidéos fonctionnent.

## Fonctionnalités

- **Analyse des transcriptions** : Capture automatique des scripts via l'API Google YouTube
- **IA** : Analyse avec GPT-5 pour générer des insights détaillés sur les vidéos
- **Métadonnées** : Affichage des statistiques (vues, likes, commentaires)

## Stack technique

- **Backend** : Django
- **Frontend** : React avec Vite
- **IA** : OpenAI GPT-5
- **YouTube** : API Google YouTube Data v3

## Installation

1. **Cloner le projet** :
```bash
git clone https://github.com/julienlucas/youtube-ai-video-analyzer
```

2. **Installer les dépendances** :
```bash
python3.12 -m venv venv
source venv/bin/activate
# Backend Django
poetry install

# Frontend React
cd frontend
pnpm install
pnpm build
```

3. **Configuration** :
Créez un fichier `.env` avec vos clés API :

allez sur https://platform.openai.com pour créer votre clé API OpenAI
allez sur https://console.cloud.google.com/ pour créer votre clé API Google (pour les transcriptions YouTube)
```bash
OPENAI_API_KEY=votre_cle_api_openai_ici
GOOGLE_API_KEY=votre_cle_api_google_ici
```

4. **Lancer l'application** :
```bash
# Backend Django
python manage.py runserver
```

## Structure du projet

- `backend/` : API Django avec gestion des vidéos et analyse IA
- `frontend/` : Interface React avec composants modernes
- `static/` : Images et ressources statiques

## Utilisation

1. Collez l'URL d'une vidéo YouTube
2. Cliquez sur "Analyser"
3. Consultez le rapport d'analyse détaillé généré
