# Consegne della chat parallela «Aiuto» (bug) · Aiuto 10 → chiusa (il resto alla principale)

**Già deciso da Mario (non richiedere):** «vai avanti da solo»; niente artefatto, Mario prova sul sito vero. Ogni funzione nuova anche nell'aiutante di Monica (`.claude/rules/progetto.md`). C101 chiusa (Mario «lo storico è risolto»). Numeri doppi negli altri progetti: Mario ha detto sì in un'altra chat (C89, principale).
**Da non rifare:** C101 (v0.9.73, usato da Mario coi dati veri); C102 (v0.9.75 online); C100 (v0.9.76).
**Cosa preme a Mario adesso:** che l'aiutante capisca il senso delle frasi (C102) e conosca tutte le funzioni (C100).

Aiuto 10 = `session_01WTjqUwG7wNgyoWoXYNwdic` (catena 8 di 8: non può aprire sessioni né sveglie), chiusa alla soglia 09/11 ~14:40. Resta poco lavoro di zona: passa alla principale (skill `chat-parallela`). Impegno: `.claude/settings.json` lasciato com'è (condiviso con la principale).

## Stato (controlla, non fidarti)
- `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/data.js | grep VERSIONE_APP` → 0.9.76 (0.9.75 controllata online alle ~14:30).
- C102 in `aiutante.js` `inviaAI`: prima `chiediAiutante` con `dati.indizi` (posti dalle parole, da `capisciDove(testo, 3)`); se l'AI non c'è o `r.fermo` → `aiutoParole`: «Intendi…?» con «Portami lì», mai partenza da sola (`daParole`). Regole «CAPIRE IL SENSO» in `worker.js` `ISTRUZIONI_AI`.
- C100: voci nuove in `DOVE_AI` (`imp-voce`, `clienti-nuovi`, `clienti-rifiutati` con `ui: {rifiutati}`, `clienti-attesa`, `ordini-storico` con `ui: {tab}`); `portaLi` applica `c.ui`. Tolta la voce morta «aggiornamenti» dal testo dell'AI. Prova in `tools/prova.js` controlla che ogni voce data all'AI esista in `DOVE_AI`.
- Prove: giro completo 66 passi (65 + C100), `tools/prova-impostazioni.js` 11 OK.

## Prossimi passi (per la principale)
1. C102 e C100: aspettare la prova di Mario con frasi sue (voci 👁 in Da fare).
2. C97: quando Mario risponde su Francesco, chiudere la causa in `docs/ERRORI.md`.
3. Firebase (Mario 09/11 ~10:25 «firebase solo account nuovo»): se vuole, guida da PC per lasciare proprietario solo l'account nuovo (Impostazioni ⚙ → Utenti e autorizzazioni; pulsanti da controllare su sue foto, poi `docs/GUIDE-GIUSTE.md`). Prima controllare che l'account nuovo sia proprietario.
4. Idea non fatta: l'AI potrebbe cambiare da sola «Accetta clienti nuovi» (chiave `nuovi` in `IMP` di `controllaAI`); oggi la porta solo lì.

## Per riaprire la catena (se Mario vuole Aiuto 11)
Mario apre una sessione nuova sul repo `Kur0ChanX/pronti-in-tavola`, ramo `claude/pronti-ramo-definitivo`, e incolla: «[AVVIO] Sei la chat parallela «Aiuto 11» (bug) di Pronti in Tavola, ramo claude/pronti-ramo-definitivo. Leggi CLAUDE.md, docs/ERRORI.md e docs/CONSEGNE-PARALLELA-aiuto.md.»

Controllo Da fare: C101 chiusa (in DA-FARE-FATTE); C102 e C100 aggiornate. Messaggi di Mario della sessione: «quando è online dimmi dove premere» (fatto), «parlami dei numeri doppi» (spiegato; risposta data nella principale), «lo storico è risolto vai avanti» (C101 chiusa).

## Ultimo messaggio di Mario (parola per parola)
«lo storico è risolto vai avanti ho detto di si per i numeri doppio in un altra chat quindi vai avanti»
