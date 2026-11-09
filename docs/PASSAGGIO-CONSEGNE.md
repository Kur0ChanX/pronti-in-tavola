# Passaggio di consegne

Sessione attuale: #35 (dopo la #34 `session_01WTjqUxkfi1LrUJwmzh137d`, chiusa alla soglia 09/11 18:22; la apre la #34 con `create_session` (catena 2 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (09/11 ~18:15):** 1) C106 🔴: su iPad, app dall'icona, in orizzontale, uscendo e rientrando la pagina resta ingrandita e tagliata (foto in `archivio/foto/2026-11-09-ipad-orizzontale-*.jpg`); 2) provare v0.9.81 (riquadro verde «Notifiche attive!», una sola richiesta per la stessa persona); 3) Francesco in Clienti (C104/C97). Il comando vocale dei clienti su iPad (C105) è della catena Voce (Voce 4): non toccare la sua zona (`docs/CHI-FA-COSA.md`).

## Stato (09/11 18:22 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Giri in corso: Pubblica sito. Nessuna PR aperta. Versione nel codice v0.9.81 (`VERSIONE_APP` in data.js; la v0.9.80 è della catena Voce).
- App: `python3 -I tools/anteprima.py && node tools/prova.js` → 72 OK, 0 NO (09/11 ~18:15, codice unito con la v0.9.80 della Voce). `SOLO=ricettario` NON funziona da solo (serve il giro completo, ~3 minuti). Dal contenitore il sito vero, GialloZafferano e Microsoft sono bloccati (curl 000): esito dei giri con `mcp__github__actions_list` (sito.yml, perPage 1).
- Motore e regole: `npm install`, `npm run prova-firebase` → 98 OK, 0 NO; `npm run prova-regole` → 66 OK, 0 NO (09/11 ~18:00). Regole cambiate in v0.9.79 (`accettaNuovi()` solo per stato 'nuovo') e pubblicate da Mario 09/11 ~17:20.
- Sito: `python3 -I tools/sito.py` → «OK sito».
- Sito vero: https://pronti-in-tavola.pronti-in-tavola.workers.dev si pubblica da solo a ogni push di file dell'app (verifica: `gh api "repos/Kur0ChanX/pronti-in-tavola/actions/workflows/sito.yml/runs?per_page=1" --jq ".workflow_runs[0].conclusion"` → success; curl → 200).
- Anteprima artefatto: NON si pubblica più (Mario 08/11 «non lo uso più»); `dist/anteprima.html` serve solo alle prove.
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.
- Soglia 320k: vale solo se l'id della sessione è quello della riga «Principale» di `docs/CHI-FA-COSA.md`: la sessione nuova ci mette il suo.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#34)
Online v0.9.78, 0.9.79 (pubblicazione `sito.yml` success); v0.9.81 pushata 18:20 (pubblicazione da controllare con `mcp__github__actions_list` sito.yml perPage 1).
- Interruttore «Accetta clienti nuovi»: letto via REST anonimo, Mario l'ha riacceso 16:47 (updateTime 15:47Z).
- v0.9.78 (C104): `bussaChiusi()` in app.js → `/api/avvisa` tipo `chiusi` (worker.js `TIPI_GESTORE`, testo in sw.js), una ogni 3 ore per telefono; il tocco apre Clienti.
- v0.9.79: regole: `accettaNuovi()` solo per 'nuovo' («ricollega» passa a porta chiusa), dati.js `registra` uguale; `serveInvito` aspetta `Dati.io.letto` e non copre il benvenuto; «Più tardi» = `P.invitoDopo` +24 h.
- v0.9.81: foglio notifiche con riquadro verde «Notifiche attive!» e chiusura da sola dopo 3 s (`chiudiInstallaDopo`); dati.js `nomiDi()`/`stessaPersona()`: la stessa persona si riconosce da chiave, nome, nomeCliente e nomiPrima (gemelli, vecchioDi, decidi) → Monica vede UNA richiesta anche se il nome è stato corretto su un telefono.
- Prove: nuove in `tools/prova-regole.js` (cliente già dentro a porta chiusa, ricollega a porta chiusa) e `tools/prova-firebase.js` (Lia: nome corretto + secondo telefono); `prova-firebase.js` aggiornato alle Impostazioni a fisarmonica (niente «altre-imp»), conferma di chiusura, foto via «Sistema la foto», lucchetto a testa.
- CLAUDE.md: riga «Stato» corretta (v0.9, dati veri).
- Controllo Da fare: 2 voci aggiunte (C106 zoom iPad; C107 prova di v0.9.81).

## Strade provate e scartate (perché; così la prossima non le rifà)
- Voci (#30): Supertonic 3 (F1, M1) e Kokoro italiano (Sara, Nicola): Mario «tono, pause e accenti sembrano stranieri». Chatterbox/OmniVoice: >1 GB, GPU. Kitten: solo inglese.
- Passi (#30): dosi dentro i passi e «una frase per riga»: Mario «falle come GialloZafferano uguali paro paro» (PT E30). Filtro dieta: GZ non lo dà, dedurlo è rischioso.
- Voci (#28): Kokoro phonemizer JS solo inglese; VoiceStudio app a sé. Ricette (#29): GZ `ricette-regionali/Sardegna` 404; Firebase Storage NO (Blaze).
- Sessioni 1-22: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` e `strade-scartate-sessioni-8-13.md`. Ricette scritte da Claude: NO (PT E25).

## Prossimi passi
1. Avvio: titolo verde ❔; a Mario una riga per riga di «Aspetta Mario». Ogni «👉 DA FARE TU» con «A cosa serve» (PT E36). Controlla che la pubblicazione della v0.9.81 sia «success».
2. C106 🔴 zoom iPad in orizzontale (app dall'icona, al rientro): cercare il comportamento di iPadOS 26/27 coi siti installati (skill `ricerca-aggiornata`), controllare il `meta viewport` di `index.html` e le larghezze fisse (`min-width`, `100vw`) in style.css; prova con Playwright `iPad Pro 11 landscape`; foto prima/dopo a Mario.
3. C107: Mario prova v0.9.81 (notifiche e richiesta unica). C104/C97: quando Francesco compare in Clienti, chiudere la causa in `docs/ERRORI.md` e le voci.
4. Domanda aperta su `CLAUDE.md` più corto (riga in «Aspetta Mario»): con «1» spostare le righe sulle prove in `.claude/rules/prove.md` (serve l'ok scritto di Mario per `.claude/`, RVC E59).
5. Idee da dire, non fare: l'AI che cambia «Accetta clienti nuovi»; teglie al giorno = contatore sul server; pizzico con due dita in «Sistema la foto».

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
09/11 ~18:12, parola per parola: «in coda quando finisci aggiungi, che se  se da tablet iPad vado in icona poi una volta che rientro esce zoomato nell'app... succede solo in orizzontale» (3 foto: normale, Home dell'iPad, zoomata → C106, in coda).
Prima: «Clicco su ipad e non succede nulla non sò se ha funzionato o meno correggi poi a monica gli escono 2 richieste anche se è la stessa persona si può correggere? una esce da link e una da app in home anxhe se è la stessa persona» (→ v0.9.81); «Fatto, ho pubblicato le regole».

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C107; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

