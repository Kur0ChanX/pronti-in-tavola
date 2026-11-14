# Passaggio di consegne

Sessione attuale: #86 (dopo la #85 `session_01WTjqUvFmqRdTVxKTg2GE7d`, chiusa alla soglia 14/11 01:28; la apre Mario (catena a 8 di 8, o cambio account): passi in `docs/kit-progetto/CAMBIO-ACCOUNT.md`).

**#86: la apre Mario (catena a 8 di 8).** #85: v0.10.33 ONLINE (C163 sconto di Monica: euro e %, doppia conferma, avviso col cuore, frase `msgSconto` nelle Impostazioni, voce aiutante `ordini-sconto`); giro 104/104, server 186/186, foto approvate da Mario. C162 Lisa: Mario è sul documento Firebase giusto (`omwfdndqiz478x`, n: 2, entro 2026-11-21); gli ho detto matita su `n` → 1, poi contatori/ordini `prossimo` 3 → 2.

- **Modo di lavorare (Mario 13/11 18:50, dopo C155):** prima di OGNI modifica scrivo a Mario cosa e perché in una riga e aspetto il suo ok; rispondo a ogni suo messaggio prima di lavorare; niente cose non chieste.
- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (14/11 01:30, #85):** C162 Lisa a n. 1 (aspettare la sua foto dopo i 2 cambi e controllare in app: Ordini → Prossimi, Lisa n. 1); foto di v0.10.33 (sconto, dal suo telefono); poi C159 vista cliente (2 domande), C161 controllo regole, foto 0.10.26/30/31, pagella Proteiche, PC di casa.

## Stato (14/11 01:28 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261114-01WTjqUvFmqR/claude/pronti-ramo-definitivo (merge con conflitti nelle consegne: `python3 -I .claude/hooks/scorta.py prendi-messaggi origin/<scorta>`, PT E85).
- **v0.10.28 ONLINE** (giro 98/98 locale, commit `[pubblica]` 8a4b4b3): C152 +70 proteiche, C154 ingredienti con @marca non più persi (92 ricette) + dosi del procedimento Pietrobon. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"` → 0.10.28; `…/ricette-video.js | grep -c '5g cacao'` → 12.
- **C154 scritte in patch** `docs/lavori-in-corso/c154-etichette.patch` (ricettario.js carta e ricetta, ricette-video.js rigenerato con 12 `controllata`, tools/prova.js passo C150+C154). Verifica: `git apply --check`; `SOLO=C150` verde.
- **Trascrizione** `tools/dati/video-dal-parlato.json`: 26 video (7 scartati). Misurato 13/11 (#77): limite GIORNALIERO gratis (~20 per modello, 429 «PerDay» su 3.8/3.7/3.6/3.5) → ~25 al giorno; ne restano 765 = ~4 settimane. La stima «17,4 ore» era sbagliata (PT E80). Sveglia ogni mattina 9:10 (`trig_01E2n2khL5VsdZX4q5C51iN3`, della #77). Domanda a Mario: gratis o a pagamento (stima 10-40 €).
- Regola nuova in `tools/raccogli_video.py`: `col_parlato` segna `controllata`; `unisci_ingredienti` = scritto + detto (aggiunge i mancanti, dose detta a chi non l'ha). Dopo ogni giorno di trascrizione: `python3 -I tools/raccogli_video.py` (cache YouTube in `.cache-stime`, sennò serve YOUTUBE_API_KEY: c'è).
- **v0.10.29 ONLINE** (#78, giro 99/99 locale, commit `[pubblica]` e8e10dc): «Scrivimi» capisce gli ordini + link `…/?ordine=<testo>` (carrello pronto, `carrelloDaLink` in app.js). Verifica: `curl -s …/data.js?x=1 | grep VERSIONE_APP` → 0.10.29; `…/app.js | grep -c carrelloDaLink` → 3. Link e messaggio WhatsApp per Lisa dati a Mario 13/11.
- **v0.10.30 ONLINE** (#81, giro 100/100 locale, commit `[pubblica]` 1e115ff): barra `.ai-cliente` ferma in cima (sticky) con un microfono solo `ai-mic[data-a=ac-detta]`, microfoni galleggianti `.vc-fab` solo nel carrello, barra in basso Menù · I miei ordini · Scrivi a Monica; C157 riquadro «Scegli la misura» + «Invia» spento. Verifica: `curl -s …/data.js?x=1 | grep VERSIONE_APP` → 0.10.30; `…/app.js | grep -c misuraManca` → 5. Patch cancellata (applicata).
- **v0.10.32 ONLINE** (#84, giro 103/103, commit `[pubblica]` c145312): C159 ordini di prova fuori da pronti e teglie (`!o.prova` in `teglieOrdine`, `presi`, `riprendiPronti`/`rimettiPronti`), «per sabato» di sabato (PT E88). PT E87: un `commit -a` aveva pubblicato C159 prima del giro.
- **v0.10.31 ONLINE** (#84, giro 102/102, commit `[pubblica]` 16e1997): C160 costo della ricetta, patch applicata e cancellata. Prima: **C160 in PATCH** (#83): `docs/lavori-in-corso/c160-unita.patch` (spesa.js, app.js, tools/prova.js; 7 punti, dettagli in `c160-costo-ricetta.md`). Verifica: `git apply --check docs/lavori-in-corso/c160-unita.patch`; dopo l'applicazione `python3 -I tools/anteprima.py && SOLO='C160|dosi nella scheda' node tools/prova.js` → 3 OK. Giro completo locale #83 con la patch applicata: 102/102 OK, nessun errore (13/11 23:26); da rifare sull'ultimo commit prima di pubblicare. Foto `archivio/foto/2026-11-13-2340-c160-dopo-1..4.png` mandate.

## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#84)
- C160: rimandate le 4 foto (Mario «rifammi la domanda»), «va bene come consiglio» → patch applicata, v0.10.31 online (giro 102/102).
- C159 ordini di prova: «1 ok come consiglio» (scritto nella #83, inoltrato) + «Correggi i 2 buchi come consiglio» → app.js `teglieOrdine`, `riprendiPronti`/`rimettiPronti` (escludono `o.prova`), `ord-prova`/`tutti-prova-si` rimettono i pronti, `ord-vero` li riprende, invio locale senza scalo; dati.js `presi`; prova `C159 ordine di prova…`. Online in v0.10.32.
- PT E87: un `git commit -am` (per un documento) ha pubblicato C159 prima del giro completo; poi il giro era verde. Difesa da fare: guardia che ferma `commit -a` con file del sito cambiati.
- PT E88: «per sabato» detto di sabato → nessun giorno (voce-clienti.js `giornoDetto`): ora, se oggi non si può più ordinare, vale il sabato dopo. Difesa da fare: prove con data finta per i 7 giorni.
- C162 Lisa: niente chiave per scrivere nel database → a Mario i passi su Firebase (contatori/ordini `ultimo` → ordine, `n` 2→1; consiglio `prossimo` 3→2). Foto in `archivio/foto/2026-11-14-0053-mario-lisa-n2-*.jpg`.
- C163 sconto: parole intere e piano nel file del lavoro; voce in DA-FARE. Controllo Da fare: 3 voci aggiunte (C162, C163, C164).

## Strade provate e scartate (perché; così la prossima non le rifà)
- #83: rifare la pagina (`salvatoOk`, `render`) quando si esce dal campo prezzo/confezione → no: il tocco subito dopo su «kg» o «Fatto» si perdeva (PT E86). Tasto dell'unità che converte il numero (250 g → 0,25 kg) → no: chi scrive «1» e poi tocca «kg» vuole 1 kg; il numero resta, cambia l'unità.
- #77: «Ordine da messaggio» per Monica (incolla o Condividi) → no: Mario «troppo che Monica deve incollare e fare, voglio automatismo». Leggere WhatsApp in automatico → impossibile sul numero normale. Scrivere l'ordine di Lisa nel database da qui → niente chiave (regole: gestore o cliente). `window.open(url,'_blank','noopener')` → dà sempre null: apriva WhatsApp due volte.
- #76: API «transcript» (youtube-transcript-api, Supadata, TranscriptAPI) → no: solo sottotitoli già esistenti, bloccate dai server cloud o ~100 crediti al mese. Filtro `%` nelle pubblicità → no: toglieva «(min 50%)» del cioccolato. Rifare `raccogli_video.py` senza C152 applicata → no: mancano i segni «proteica»; prima le stimate, poi i video.
- #75: rifare tutte le stimate con la stima nuova (`main` riscrive il file) → no: 72 vecchie cambiavano valori già visti da Mario; si aggiungono solo le nuove (`--aggiungi`). Dosi dal procedimento per 2foodfitlovers e Beardedscara → no: frasi raccontate («100 g di e completate…», «1 kg di farina» di un'altra ricetta). `valida_stima.py` → senza cache non misura niente.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
1. Rispondere SUBITO all'ultimo messaggio di Mario (PT E82). Aperte: C162 Lisa (n 2→1 e prossimo 3→2 su Firebase: aspetta la sua foto), foto sconto v0.10.33.
2. C163 FATTA e online (v0.10.33): chiudere la promessa 👁 solo quando Mario manda la foto dall'app. Idee non fatte: sconto anche dall'aiutante a voce (oggi solo «portami lì»).
3. C162: se Mario si blocca, guidarlo con foto (GUIDE-GIUSTE.md: Firebase); a fine passi scrivere in GUIDE-GIUSTE i pulsanti veri.
4. C159 vista cliente dopo le 2 risposte (gesto, tocchi). C161 col «1». Poi i vecchi: foto menù 0.10.30, trascrizione (sveglia #77), scritte C154, idee C149, pagella C141.
⛔ NON unire le scorte `01WTjqUup234` (#66), `01WTjqUwz4Kr` (#67), `01WTjqUvtoJC` (#70), `01WTjqUuVK9Q` (#83, il suo codice era la patch C160, già online).

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 23; prime C163 sconto 🛑 e C162 Lisa).

## Ultimo messaggio di Mario
14/11 01:23 (foto Firebase 01:25-01:28 dopo): «le foro dello sconto sembrano ok e poi riesci a passare dall'ordine 2 a 1 in lisa senza rompere nulla perché è il vero primo ordine che arriva a Monica» → sconto v0.10.33 online; Lisa: passi a mano su Firebase (n 2→1, prossimo 3→2), Mario è sul documento giusto, aspetta la sua foto. Prima: 01:12 «1 1 ok / 2 in tutti e 2 i modi».

## Dopo le consegne (Mario 14/11, dopo la chiusura della #85)
- «ok fatto è andato spero non si sia rotto nulla» = dice di aver fatto i 2 cambi su Firebase per Lisa (n 2→1, prossimo 3→2). Poi Mario: «è numero 1 lisa ora nell'app grazie, vai avanti ora» → C162 CHIUSA (riga tolta da Aspetta Mario). «Vai avanti» = la #86 riparte dai Prossimi passi.

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C165; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Medio** (`medium`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-14 01:11 · [AVVIO] Sessione #85 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio, titolo, promemoria domande
- 2026-11-14 01:23 · le foro dello sconto sembrano ok e poi riesci a passare dall'ordine 2 a 1 in lis… → C163 foto ok → v0.10.33 online; C162 Lisa passi a mano su Firebase (n 2→1, prossimo 3→2)

Ultimo, intero:
> le foro dello sconto sembrano ok e poi riesci a passare dall'ordine 2 a 1 in lisa senza rompere nulla perché è il vero primo ordine che arriva a Monica

