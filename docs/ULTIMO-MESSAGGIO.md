# Ultimo messaggio di Mario (11/11/2026 17:56 ora italiana)

Compito unico e breve della principale (niente avvio completo, niente altro lavoro, niente consegne, niente commit): controlla che la chiave YouTube funzioni. Esegui SOLO:
[ -n "$YOUTUBE_API_KEY" ] && echo var-si || echo var-no
curl -sS -m 20 "https://www.googleapis.com/youtube/v3/search?part=snippet&q=pietrobon&type=channel&maxResults=1&[segreto tolto dalla scorta] | head -c 400
Mai stampare il valore della chiave. Poi manda l'esito (var-si/no, titolo del canale trovato oppure il messaggio d'errore, chiave tolta) con send_message a [segreto tolto dalla scorta] e chiudi.
