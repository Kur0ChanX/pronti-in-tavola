# Passaggio di consegne

Sessione attuale: #32 (dopo la #31 `session_01WTjqUxaoNFTMAXv2DieDxY`, chiusa alla soglia 08/11 15:56; la apre la #31 con `create_session` (catena 6 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (08/11 ~16:00):** 1) provare nell'app «Sistema la foto» (C84) e l'avviso «Riavvia» (C85); 2) versione + ora vera sempre in vista (C82) e prezzi dalla scheda del piatto (C81); 3) voce: resta Paola, la voce Google c'è ma Mario non la usa («lascia così per il momento»).

## Stato (08/11 15:56 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Giri in corso: Pubblica sito. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261108-01WTjqUxaoNF/claude/pronti-ramo-definitivo.
- App: `python3 -I tools/anteprima.py && node tools/prova.js` → 47 OK, 0 NO (08/11 ~09:00). `SOLO=ricettario` NON funziona da solo (serve il giro completo, ~3 minuti). Dal contenitore il sito vero, GialloZafferano e Microsoft sono bloccati (curl 000): esito dei giri con `mcp__github__actions_list` (sito.yml, perPage 1).
- Motore e regole: `npm install`, `npm run prova-firebase` → «88 OK, 0 NO» (07/11 ~17:45); regole non toccate.
- Sito: `python3 -I tools/sito.py` → «OK sito».
- Sito vero: https://pronti-in-tavola.pronti-in-tavola.workers.dev si pubblica da solo a ogni push di file dell'app (verifica: `gh api "repos/Kur0ChanX/pronti-in-tavola/actions/workflows/sito.yml/runs?per_page=1" --jq ".workflow_runs[0].conclusion"` → success; curl → 200).
- Anteprima artefatto: NON si pubblica più (Mario 08/11 «non lo uso più»); `dist/anteprima.html` serve solo alle prove.
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.
- Soglia 320k: vale solo se l'id della sessione è quello della riga «Principale» di `docs/CHI-FA-COSA.md`: la sessione nuova ci mette il suo.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#31)
Online fino a v0.9.51 (ogni versione: giro completo verde, push con HEAD = origin). Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep -o "VERSIONE_APP = '[0-9.]*'"`.
- v0.9.45 (C77 chiusa): «Voce Google del telefono» seconda in «Voce che legge» (`VOCE_GOOGLE='tel:google'`, `voceGoogle()` aiutante.js; riga di stato in `vociLocaleRiga` ricettario.js). Mario: non la usa, resta.
- v0.9.48 (C82): ora VERA delle versioni. `const PUBBLICATE = {}` in data.js, riempita da `tools/sito.py` `ore_vere()` (online = ora della pubblicazione, altre = primo commit con `VERSIONE_APP = 'x'`; sito.yml `fetch-depth: 0`) e da `tools/anteprima.py`. `oraNovita/quandoNovita` app.js usano PUBBLICATE. `versioneMini()` app.js: «v0.9.xx hh:mm» in alto per Mario (puoSviluppare) anche senza barra dev. Il campo `ora:` scritto a mano non serve più (PT E33).
- v0.9.49 (C81): «Quanto ti costa» (`costoPiatto` spesa.js) ha un tasto per ogni ingrediente senza prezzo → foglio `spesa-ing`.
- v0.9.51 (C84): «Sistema la foto» in `caricaFoto` app.js (`UI.rit`, `ritRuotata`, `ritRiquadro`, `ritDisegna`, `foglioRitaglio`, `ritFinisci`, azioni `rit-*`, trascinamento con pointer events); forma di base 4:3 per i piatti, «intera» per le foto del menù; CSS `.rit-cornice`, `.rit-cursore`.
- v0.9.51 (C85): aggiornamento SOLO col tocco: `riavviaQuandoPuoi` mostra `#agg-avviso` (Riavvia / Dopo = 10 min); `riavviaOra` fa blur, aspetta `Dati.inAttesa` (max 5 s), ricorda vista, scroll e foglio (JSON) in `pit-ripresa`.
- Tre chat sullo stesso ramo (Aiuto 2 chiusa, Aiuto 3) hanno preso più volte gli stessi numeri (versioni 0.9.43/46/47/50, C74/C79/C80/C83): unito e rinumerato ogni volta. Proposta a Mario: controllo automatico (domanda in «Aspetta Mario»).
- Prove: giro completo 53 OK sull'ultimo codice.

## Strade provate e scartate (perché; così la prossima non le rifà)
- Voci (#30): Supertonic 3 (F1, M1) e Kokoro italiano (Sara, Nicola): Mario «tono, pause e accenti sembrano stranieri». Chatterbox/OmniVoice: >1 GB, GPU. Kitten: solo inglese.
- Passi (#30): dosi dentro i passi e «una frase per riga»: Mario «falle come GialloZafferano uguali paro paro» (PT E30). Filtro dieta: GZ non lo dà, dedurlo è rischioso.
- Voci (#28): Kokoro phonemizer JS solo inglese; VoiceStudio app a sé. Ricette (#29): GZ `ricette-regionali/Sardegna` 404; Firebase Storage NO (Blaze).
- Sessioni 1-22: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` e `strade-scartate-sessioni-8-13.md`. Ricette scritte da Claude: NO (PT E25).

## Prossimi passi
1. Avvio: titolo verde; a Mario una riga per riga di «Aspetta Mario» (anche la domanda sul controllo dei numeri doppi).
2. Se Mario dice 1 al controllo dei numeri: hook/guardia che prima del push confronta `VERSIONE_APP` e i C nuovi con `origin` e ferma i doppioni (skill `nuova-regola`, è una regola del kit: chiedere se vale per tutti i progetti).
3. Aspettare le prove di Mario: C84 foto, C85 avviso, C82 versione in vista, C81 prezzi; più le vecchie (filtri C69, Pastiera C73, AI C71, velocità C70).
4. Idea non chiesta (dire a Mario, non fare): pizzico con due dita per ingrandire in «Sistema la foto».

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
08/11 ~16:00, parola per parola: «Con Monica volevo scrivere con Monica.» (correzione del dettato: nel messaggio prima «comunica» = «con Monica»; il ritaglio delle foto è per Monica, già capito così). Prima: «Poi quando esce un aggiornamento, non aggiornare in automatico, perché magari qualcuno sta facendo qualcosa nell'applicazione e lo sbatti fuori. Chiedi, metti un alert, nel senso fai finire quello che sta facendo, poi clicca riavvia, riavvia per applicare aggiornamento, si riavvia e ritorna nella pagina dove era, salvando quello che stava facendo.»; «Ho un problema, comunica, siccome quando scarica le foto da internet le vuole ritagliare… un editor tipo di ritaglio… Molto plug and play.»

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C88; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Medio** (`medium`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).


Controllo Da fare: 0 voci aggiunte (le richieste di Mario della #31 sono già righe: C77 chiusa, C81, C82, C84, C85; riga in «Aspetta Mario» per il controllo dei numeri doppi).
