# C150 · Ricette dal parlato dei video (trascrizione)

## Parole di Mario (13/11/2026, sessione #71), parola per parola
> Riesci per ogni singolo video a magari, non so, riesci a capire quello che dici nel video e fai la ricetta, perché altre intelligenze artificiali riescono, quindi magari dalle parole che dicono ti prendi il testo e ci fai la ricetta, anche perché nei video dicono spesso le quantità, quindi a te le quantità servono. Quindi puoi farlo per ogni singolo video, caricare magari un programmino che lo fa, non so, una skill, un MCP, un qualcosa da collegarlo, e ti trascrivi tutto quello che dicono e da lì prendi quello che ti serve, no? Per ogni singolo video.

## Numeri di oggi (#71, con la patch C148)
- 798 ricette video: 140 senza dosi scritte (Pietrobon 103, 2foodfitlovers 23, Cotto al Dente 12, Beardedscara 2); 403 senza valori; nessuna coi passi scritti (sono nel video).

## Strade (ricerca Parallel Search 13/11/2026, pagine ufficiali)
| N | Strada | Pro | Contro |
|---|---|---|---|
| 1 | Gemini API di Google col link di YouTube (ai.google.dev/gemini-api/docs/video-understanding, 13/10/2026) | ufficiale; «in prova, gratis»; ascolta e guarda il video (anche le dosi scritte a schermo); 8 ore di video al giorno gratis | serve una chiave di Mario (Google AI Studio, progetto senza carta); col piano gratis Google usa le richieste per migliorarsi (qui solo video pubblici, niente dati di Monica); «in prova»: prezzi e limiti possono cambiare |
| 2 | Sottotitoli di YouTube | gratis | API ufficiale: solo il proprietario del video (captions.download, 403); librerie non ufficiali bloccate dai server cloud e contro le regole di YouTube |
| 3 | Scaricare l'audio e trascriverlo (Whisper) | preciso | scaricare da YouTube è contro le sue regole; bloccato dai server cloud |
| 4 | Servizi a pagamento di trascrizioni | pronti | soldi; leggono YouTube in modo non ufficiale |
Consiglio: 1. Raggiungibile dal contenitore (13/11: Google risponde 403 senza chiave = rete aperta).

## Come (strada 1, quando c'è la chiave)
- `tools/trascrivi_video.py` gira nelle sessioni di Claude (mai il server dell'app, Mario 13/11 ~09:45): per ogni video chiede a Gemini in JSON porzioni, ingredienti con grammi, passi, valori se li dice; «null» se non li dice, mai inventare (PT E25). Prima le 403 senza valori.
- Dosi del video → `tools/stima.py` → valori «≈ stimati»; scritta «📝 dal video» e link al video; 10 ricette controllate a occhio contro il video, foto a Mario prima di metterle online.
- Tempo (stima): ~800 video, 1-10 minuti l'uno → circa 5-9 giorni col limite gratis di 8 ore al giorno.

## Stato
- 13/11 #71: ricerca e strade; DOMANDA 1 🛑 a Mario (strada e chiave). Chiave: variabile `GEMINI_API_KEY` nelle impostazioni dell'ambiente (come `YOUTUBE_API_KEY`), mai in chat.
