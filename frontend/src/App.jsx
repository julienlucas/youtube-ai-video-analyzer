import { useCallback, useState, useEffect } from 'react';
import leoduff from '../../static/leoduff.jpg'
import balo from '../../static/balo.jpg'
import hardisk from '../../static/hardisk.jpg'
import micode from '../../static/micode.jpg'
import benjamincode from '../../static/benjamincode.jpg'

function App() {
  const exampleAnalysis = `
    <h2> Résumé (3–5 points clés)</h2>
    - Le gouvernement américain considère TikTok (ByteDance) comme un risque de sécurité nationale, soupçonné d’outil d’<strong>espionnage</strong> et de <strong>propagande</strong> au profit du Parti communiste chinois, avec un projet de loi visant une <strong>cession forcée</strong> ou une <strong>interdiction</strong> aux États-Unis.<br/>
    - La vidéo relie TikTok aux conflits en <strong>Ukraine, Palestine et Irak</strong> pour illustrer le rôle des plateformes dans la <strong>guerre informationnelle</strong> et la formation de l’opinion publique via l’algorithme.<br/>
    - Les enjeux portent sur la <strong>souveraineté des données</strong>, le contrôle des <strong>algorithmes</strong> et la capacité d’un État étranger à <strong>influencer</strong> des audiences massives.<br/>
    - Une interdiction américaine pourrait provoquer un <strong>effet domino</strong> international, avec des impacts pour les utilisateurs, les créateurs et les entreprises.<br/>
    - Intégration d’un segment sponsorisé par <strong>Odoo</strong> (facturation, site web, gestion d’entreprise), mettant en avant une <strong>première application gratuite</strong> et un <strong>plan payant</strong> au-delà.<br/><br/>

    <h3>Principaux sujets abordés</h3>
    - Sécurité nationale et régulation tech aux États-Unis (projet de loi de cession ou bannissement de TikTok).<br/>
    - Propagande, désinformation et <strong>soft power</strong> via les réseaux sociaux.<br/>
    - Données personnelles, <strong>gouvernance algorithmique</strong> et risques d’influence étatique.<br/>
    - Conséquences possibles d’un bannissement pour l’écosystème des créateurs et des marques.<br/>
    - Segment sponsor: présentation d’<strong>Odoo</strong> (facturation, CRM, site, gestion, tarification).<br/><br/>

    <h3>Public cible</h3>
    - Personnes intéressées par la <strong>tech</strong>, la <strong>géopolitique</strong> et les <strong>politiques numériques</strong>.<br/>
    - Utilisateurs de réseaux sociaux et <strong>créateurs de contenu</strong> sensibles aux implications d’une éventuelle interdiction.<br/>
    - <strong>Entrepreneurs/PME</strong> interpellés par la solution Odoo évoquée dans la vidéo.<br/><br/>

    <h3>Analyse de la qualité du contenu</h3>
    - Clarté et pédagogie: ouverture accrocheuse liant conflits géopolitiques et TikTok, ce qui contextualise bien l’enjeu de la guerre informationnelle. La problématique “plan secret de TikTok” sert de fil narratif efficace.<br/>
    - Fond et nuances: la vidéo met en avant des préoccupations légitimes (données, algorithmes, influence). D’après la transcription fournie (tronquée et partiellement corrompue), il est difficile d’évaluer l’ampleur des sources et contre-arguments présentés; le sujet gagnerait à confronter explicitement les positions (mesures de mitigation de TikTok, arguments des défenseurs de la liberté d’expression, comparaisons avec d’autres plateformes).<br/>
    - Rigueur: les liens entre conflits et influence algorithmique sont pertinents, mais exigent des exemples et données vérifiables pour éviter la simplification. Une mise en perspective juridique (cadres nationaux et internationaux) renforcerait la crédibilité.<br/>
    - Narration et rythme: style dynamique, bonne vulgarisation; l’intégration du sponsor est claire et pédagogique (démonstration de la facturation, modèle freemium), mais relativement longue et peut interrompre le flux du sujet principal.<br/>
    - Améliorations possibles: expliciter les sources, quantifier l’impact (études, chiffres), détailler les mécanismes techniques (modération, accès aux données, audits), et comparer.<br/>
  `
  const [input, setInput] = useState('')
  const [analysis, setAnalysis] = useState("")
  const [thumbnail, setThumbnail] = useState(leoduff)
  const [metadata, setMetadata] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [seconds, setSeconds] = useState(0)

  const convertMarkdownToHtml = useCallback((text) => {
    return text
      .replace(/#### (.*?)(?=\n|$|####|###)/g, '<h3 class="mt-2 -mb-3">$1</h3>')
      .replace(/### (.*?)(?=\n|$|###|##)/g, '<h3 class="mt-2 -mb-3">$1</h3>')
      .replace(/## (.*?)(?=\n|$|###|##)/g, '<h3 class="mt-2 -mb-3">$1</h3>')
      .replace(/(\d+\. \*\*.*?\*\* :)/g, '<h4>$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/- \*\*(.*?)\*\* : (.*?)(?=\n-|\n\n|$)/g, '<li><strong>$1</strong> : $2</li>')
      .replace(/(<li>.*?<\/li>)/gs, '<ul class="list-disc list-inside mt-2">$1</ul>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
     setThumbnail("")
     setAnalysis("")
     setMetadata({})
     setIsLoading(true)

    try {
      const response = await fetch('generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: input }),
      })

      const data = await response.json()

      setThumbnail(data.thumbnail && data.thumbnail.length > 0 ? data.thumbnail[data.thumbnail.length - 1].url : null)
      setAnalysis(convertMarkdownToHtml(data.analysis))
      console.log(data.analysis)
      console.log(convertMarkdownToHtml(data.analysis))
      setMetadata(data.metadata)
      setIsLoading(false)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
      setInput('')
    }
  }

  useEffect(() => {
    if (isLoading) {
      setThumbnail("")
      setAnalysis("")
      setMetadata({})
    }
  }, [isLoading])

  useEffect(() => {
    let interval
    if (isLoading) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 0.1)
      }, 100)
    } else {
      setSeconds(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLoading, seconds])

  return (
    <main className="max-w-7xl mx-auto px-2 mt-24 smooth-scroll antialiased">
      <header className="relative flex items-center justify-center gap-4 pt-14">
        <p className="absolute -top-1 left-0 flex items-center justify-center">
          <span className="logo">CRÉATEURS<br/> YOUTUBE</span>
        </p>
        <button className="absolute -top-18 right-0 flex items-center gap-2">
          Github
          <svg
            className="w-6 h-6 -ml-2 -mr-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M7 17L17 7M17 7H7M17 7V17"/>
          </svg>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="mt-12">
          <div className="relative">
            <svg
              className="absolute left-12 mt-8 w-18 h-18 text-red-600 -rotate-20 z-10"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <h1 className="relative z-20">Analyseur de vidéos<br/> <span className="">pour les créateurs Youtube</span></h1>
            <h2 className="mb-16 text-xl font-medium">L'IA te décortique pourquoi les vidéos marchent</h2>
            <svg
              className="absolute top-12 right-14 w-14 h-14 text-red-600 rotate-20 z-10"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <div className="relative thumbnails -mt-8 grid grid-cols-5">
              <img className="rounded-sm w-auto mb-16 -rotate-3" src={leoduff} alt="julienLucas" />
              <img className="rounded-sm w-auto mb-16 -rotate-3" src={benjamincode} alt="julienLucas" />
              <img className="rounded-sm w-auto mb-16 -rotate-3" src={balo} alt="julienLucas" />
              <img className="rounded-sm w-auto mb-16 -rotate-3" src={hardisk} alt="julienLucas" />
              <img className="rounded-sm w-auto mb-16 -rotate-3" src={micode} alt="julienLucas" />
            </div>
            <div>
              <div className="-mt-8 border border-white p-4 rounded-lg">
                <h2 className="text-xl font-medium">À propos de cette application :</h2>
                <ul className="list-disc list-inside">
                  <li><strong>Capture de transcript</strong> : Le script est capturé via l'API Google Youtube.</li>
                  <li><strong>Analyse avec GPT5</strong> : Un prompt est envoyé à l'IA pour analyser le script et générer un rapport détaillé.</li>
                </ul>
              </div>
            </div>
          </div>

          <form className="flex items-center justify-center mb-6 mt-6">
            <input
              type="text"
              className="w-full"
              placeholder="Entrer l'url de la vidéo..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={handleSubmit}>Analyser</button>
          </form>
          {thumbnail && <img className="rounded-xl w-full" src={thumbnail} alt="" />}
          {metadata?.title && (
            <div className="mt-6">
              <strong>Statistiques de la vidéo :</strong>
                <p className="mt-2 -mb-1"><strong>{metadata.views}</strong> vues</p>
                <p className="-mb-1"><strong>{metadata.likes}</strong> likes</p>
                <p className="-mb-1"><strong>{metadata.comments}</strong> commentaires</p>
            </div>
          )}
        </div>
        <div className="w-full max-w-4xl mx-auto mt-0 md:mt-12 h-full">
          {!isLoading && (<p className="mb-1">Analyse GPT5 de la vidéo :</p>)}
          {(metadata?.title && !isLoading) ? (
            <>
              <h2>{metadata.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: analysis }} />
            </>
          ) : !isLoading ? (
            <div dangerouslySetInnerHTML={{ __html: exampleAnalysis }} />
          ) : isLoading && (
            <div className="">
              <p>Analyse en cours... {seconds.toFixed(1)}s</p>
              <div className="flex items-center justify-center h-full min-h-[800px]">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <footer>
        <p className="text-center text-sm">
          <a href="https://www.youtube.com/@JulienLucas" className="text-white" target="_blank" rel="noopener noreferrer">🤍 Par @julienlucas sur Youtube</a>
        </p>
      </footer>
    </main>
  )
}

export default App
