# Passaggio di consegne

Sessione attuale: #2 (dopo la #1 `session_01QTFEqUfb9wLHtBnMRef5Rb`, chiusa alla soglia 05/11 08:30; la apre la #1 con `create_session` (catena 1 di 8)).

- **Già deciso da Mario (non richiedere):** cos'è l'app e chi la usa (Monica cucina a Olbia, le amiche ordinano dal link WhatsApp, ritiro a casa sua); app web sulla schermata Home, gratis; dati online gratuiti con Firebase come Jona; solo contanti; tutto in `docs/SPECIFICA.md` e nella consegna della chat `archivio/CONSEGNA-CHAT-2026-11-05.md`. Kit RVC: sì («si kit»), installato.
- **Da non rifare:** domande già spiegate nella chat (PT E4); installazione del kit (fatta, 21/21 verdi); i decori sardi (fatti, aspettano solo il parere di Mario).
- **Cosa preme a Mario adesso:** avere l'app vera con i dati condivisi, così gli ordini delle amiche arrivano davvero a Monica; senza perdere niente di quello che è stato deciso nella chat.

## Stato (05/11 08:30 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?. Scorte NON unite: scorta-principale-20261105-01QTFEqUfb9w/claude/pronti-ramo-definitivo.
- App v0.7 di prova (dati solo sul telefono) + decori sardi. Verifica: `python3 -I tools/anteprima.py && node tools/prova.js` → 19 «OK» e «Nessun errore nella pagina».
- Anteprima pubblicata (versione 12, con i decori): https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH. Verifica: la pagina mostra la bordura a rombi accanto a «Stuzzichini».
- Kit RVC 35.0 installato. Verifica: `for t in tools/test-*.py; do python3 -I $t; done` → 21 verdi; all'avvio «Kit 35.0» senza «ATTENZIONE».

## Riferimenti
- Consegna completa della chat (scopo, funzioni fatte, decisioni e perché, scelte tecniche, aperto): `archivio/CONSEGNA-CHAT-2026-11-05.md`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole del prodotto: `.claude/rules/progetto.md`.

## Sessione appena chiusa (#01, prima di Claude Code)
- Zip della chat estratto nel repo, ramo `claude/pronti-ramo-definitivo` creato e salvato su GitHub (l'accesso dell'app Claude a GitHub ora funziona).
- Decori sardi leggeri in `style.css`: sfondo con trama «a pibiones» (puntini a rombo, bordeaux al 7,5%) e bordura a rombi accanto ai titoli del menù al posto della riga. Commit `30a3a49`.
- Kit RVC 35.0 «indipendente» installato (commit `d3eb3a3`). Il pacchetto non contiene `tools/consegne.py`: copiato da RVC e adattato (repo, icona). Voce C9 del Da fare per avvisare RVC.
- `CLAUDE.md` accorciato sotto il tetto di 1.000 token (lo segnalava `kit-check.py`).
- Preferenze: Mario ha incollato la v35, identica al kit; la sessione partiva con la v27. Da ora vale la v35.
- Valutazione del kit chiesta da Mario: veloce (ogni controllo 25-110 ms per strumento, avvio ~1,3 s, misurati), regole fisse ~19 KB a ogni avvio (~5.500 token, stima). Verdetto: tenerlo.
- File toccati: `style.css`, `CLAUDE.md`, `docs/ERRORI.md`, `docs/DA-FARE.md`, `docs/STORIA-REGOLE.md`, `docs/PASSAGGIO-CONSEGNE.md`, `docs/CHI-FA-COSA.md`, `.claude/` (kit e `rules/`), `tools/` (kit e `consegne.py`), `archivio/CONSEGNA-CHAT-2026-11-05.md`.
- Controllo Da fare: 2 voci aggiunte (C9 kit, «## 0. Aspetta Mario»).

## Strade provate e scartate (perché; così la prossima non le rifà)
- Costruire l'app da zero: Mario ha detto che l'app esiste già nella chat (consegna in `archivio/`).
- Installare il kit con `installa.py`: il kit lo vieta; file estratti dal pacchetto e copiati.

## Prossimi passi
1. Rispondere a Mario sulle domande in «## 0. Aspetta Mario» di `docs/DA-FARE.md`.
2. C1 dati veri con Firebase: prima la specifica corta (raccolte, regole di sicurezza, link d'invito, accesso di Monica) da far vedere a Mario; poi i passi a mano per creare il progetto Firebase, uno alla volta, con i nomi dei pulsanti controllati sul sito.
3. C2 foto: ricerca aggiornata (mese e anno) su Firebase Storage e piano gratuito.

## Domande aperte
- In «## 0. Aspetta Mario» di `docs/DA-FARE.md`.

## Ultimo messaggio di Mario
«Prima valuta se il kit è performante, è meglio del tuo e poi installalo. Se non ti convince, aspetta.»

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C11; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, `.claude/settings.json`): li eredita la sessione nuova, a Mario non si chiede di sceglierli (E277).

