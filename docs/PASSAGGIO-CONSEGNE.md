# Passaggio di consegne

Sessione attuale: #34 (dopo la #33 `session_01WTjqUwCuTdUjXP6DJCbr8T`, chiusa alla soglia 09/11 15:02; la apre Mario (catena 8 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda: app, Firebase, Cloudflare, passaparola, ricettario, aiutante AI, voce, foto del menù NO, ecc.).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`. Dalla #16 alla #19: stesso file, in fondo. Dalla #27 alla #30: vedi «Sessione appena chiusa» qui sotto. Dalla #20 alla #26: stesso file, in fondo (la #26: v0.9.18-0.9.26 del ricettario, voce vera Microsoft, «📥 Scarica», «💾 Copia di sicurezza»).
- **Cosa preme a Mario adesso (09/11 ~14:30):** 1) Francesco (telefono vero) bloccato da «Accetta clienti nuovi» spento sul server dalle 11:01: Mario deve riaccenderlo (riga in «Aspetta Mario»), poi Francesco rientra e deve comparire in Clienti (C104, C97); 2) provare la v0.9.77 (conferma + avviso rosso «Riapri») e le vecchie 👁; 3) regola nuova «dimmi sempre a cosa serve» (C103): ogni «👉 DA FARE TU» con la riga «A cosa serve».

## Stato (09/11 15:02 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?.
- App: `python3 -I tools/anteprima.py && node tools/prova.js` → 54 OK, 0 NO + `node tools/prova-impostazioni.js` → 7 OK (08/11 ~16:45). `SOLO=ricettario` NON funziona da solo (serve il giro completo, ~3 minuti). Dal contenitore il sito vero, GialloZafferano e Microsoft sono bloccati (curl 000): esito dei giri con `mcp__github__actions_list` (sito.yml, perPage 1).
- Motore e regole: `npm install`, `npm run prova-firebase` → «88 OK, 0 NO» (07/11 ~17:45); regole non toccate.
- Sito: `python3 -I tools/sito.py` → «OK sito».
- Sito vero: https://pronti-in-tavola.pronti-in-tavola.workers.dev si pubblica da solo a ogni push di file dell'app (verifica: `gh api "repos/Kur0ChanX/pronti-in-tavola/actions/workflows/sito.yml/runs?per_page=1" --jq ".workflow_runs[0].conclusion"` → success; curl → 200).
- Anteprima artefatto: NON si pubblica più (Mario 08/11 «non lo uso più»); `dist/anteprima.html` serve solo alle prove.
- Kit RVC 35.0. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → tutti verdi.
- Soglia 320k: vale solo se l'id della sessione è quello della riga «Principale» di `docs/CHI-FA-COSA.md`: la sessione nuova ci mette il suo.

## Riferimenti
- Consegna della chat: `archivio/CONSEGNA-CHAT-2026-11-05.md`. Decisioni: `docs/SPECIFICA.md`. Piano dati: `docs/SPEC-FIREBASE.md`. Lavori: `docs/DA-FARE.md` (C1, C3, C11). Regole del prodotto: `.claude/rules/progetto.md`; prove: `.claude/rules/prove.md`.

## Sessione appena chiusa (#33)
Online v0.9.60, 0.9.72, 0.9.74, 0.9.77 (giro completo verde ogni volta, pubblicazione `sito.yml` success).
- v0.9.60 (C92): lotto 2 impostazioni in `opzioni.js`: tipo `parti` (CATEGORIE segue `S.impostazioni.parti` con `applicaParti()` in render; `valoreParti`, `partiPiene`, editor con ↑↓✕ e «Aggiungi»), saluto, pausaTesto, altroPagare, invitoAmici (`{link}`), bigliettoTitolo/Sotto; a voce «aggiungi la parte secondi» in `capisciDove` (regex, senza rete). Non fatti e perché: `docs/SPEC-IMPOSTAZIONI.md` «Non fatti».
- v0.9.72: `SEGNO_CODICE` in app.js: MARIO 🦝, MONICA ❤️ al posto della ⭐.
- v0.9.74 (PT E35): velocità della voce: `velDiTutti()` (S.impostazioni.voceVel, base 0,75, la sceglie Mario), `velMia()` (localStorage `pit-vel-voce`, per chi non è Mario), cursore vero `.vel-cursore` + «− lenta/veloce +»; il vecchio `velVoce` ignorato. Funzioni in app.js (non aiutante.js: PT E23).
- v0.9.77 (C104, PT E37): `avvisoChiusi()` (Home e Clienti, tasto `nuovi-riapri`), `foglioChiudiNuovi` prima di spegnere `i.nuovi`, il cliente bloccato tiene il nome (`ricordaNome`). Causa letta sul server via REST con accesso anonimo (`identitytoolkit signUp` + `firestore.googleapis.com … impostazioni/app`): `nuovi: false`, updateTime 10:01Z.
- `archivio/animazione-ynoy/`: pagina col codice esatto della firma YNOY, video 4K/1080p 60 fps, griglia di fotogrammi, LEGGIMI (mandati a Mario per un altro progetto).
- `docs/PER-IL-KIT.md` (NUOVO): C89 (numeri doppi), C20 (link), C103 («a cosa serve») da portare nel kit da una sessione del kit RVC.
- Aiuto 10 chiusa (catena 8 di 8): la zona Aiuto passa alla principale (`docs/CONSEGNE-PARALLELA-aiuto.md` «Prossimi passi»).
- Controllo Da fare: 2 voci aggiunte (procione/cuore e animazione, già fatte → `docs/DA-FARE-FATTE.md`).

## Strade provate e scartate (perché; così la prossima non le rifà)
- Voci (#30): Supertonic 3 (F1, M1) e Kokoro italiano (Sara, Nicola): Mario «tono, pause e accenti sembrano stranieri». Chatterbox/OmniVoice: >1 GB, GPU. Kitten: solo inglese.
- Passi (#30): dosi dentro i passi e «una frase per riga»: Mario «falle come GialloZafferano uguali paro paro» (PT E30). Filtro dieta: GZ non lo dà, dedurlo è rischioso.
- Voci (#28): Kokoro phonemizer JS solo inglese; VoiceStudio app a sé. Ricette (#29): GZ `ricette-regionali/Sardegna` 404; Firebase Storage NO (Blaze).
- Sessioni 1-22: `docs/lavori-in-corso/strade-scartate-sessioni-1-7.md` e `strade-scartate-sessioni-8-13.md`. Ricette scritte da Claude: NO (PT E25).

## Prossimi passi
1. Avvio: titolo verde ❔; a Mario una riga per riga di «Aspetta Mario» (prima: riaccendere «Accetta clienti nuovi»). Ogni «👉 DA FARE TU» con «A cosa serve» (PT E36).
2. C104/C97: quando Mario dice che l'ha riacceso e Francesco è entrato: chiudere la causa in `docs/ERRORI.md`, voce 🔴 → verde. Se Francesco non compare: leggere `utenti/` non si può (regole), chiedere a Mario la foto di Clienti.
3. Zona Aiuto ereditata: C102/C100 aspettano la prova di Mario; guida Firebase «solo account nuovo» solo se Mario la chiede (`docs/CONSEGNE-PARALLELA-aiuto.md` 3).
4. Idee da dire, non fare: l'AI che cambia «Accetta clienti nuovi» (chiave `nuovi` in `IMP`); teglie al giorno = contatore sul server; pizzico con due dita in «Sistema la foto».
5. Lotto 2 non fatti (reparti spesa, porzioni teglie): solo se Mario li chiede.

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
09/11 ~14:50, parola per parola: «Cioè, non hai bloccato l'app, scusa, però non capisco questo messaggio qui. Strano, cosa significa? Cioè, non... risolviamo tutto, per piacere. Che funzioni tutto bene. Valuta tutto con estrema attenzione, tutte le variabili e risolvi.» (→ C104: risposto con la spiegazione e il passo per riaccendere; v0.9.77 online).
Prima: foto del telefono di Francesco «mi hai bloccato l'app?!?… né aggiungi a home né notifiche… Risolvi tutto bene una volta per tutte»; «regola per tutti i progetti ed account dimmi sempre a cosa serve quello che vuoi farmi fare» (C103, PT E36); «c89 come consiglio».

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C105; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-fable-5-1** (Fable 5.1) · impegno **Medio** (`medium`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

