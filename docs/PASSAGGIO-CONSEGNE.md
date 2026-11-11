# Passaggio di consegne

Sessione attuale: #66 (dopo la #65 `session_01WTjqUumr4nH1ZeRWix2tJQ`, chiusa alla soglia 11/11 19:40; la apre la #65 con `create_session` (catena 4 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (11/11 #64):** 1) 🛑 C140: Mario 19:20 «se lo rendiamo privato e mettiamo il mio PC?» → DOMANDA 1 riscritta con 3 scelte (1 pubblico solo GitHub · 2 pubblico col PC · 3 privato + PC poi GitHub, consiglio); 2) 🛑 foto della pagella (C141, già ONLINE, PT E69): «1» va bene, «2» cosa cambiare; 3) ok per accendere la difesa C143 (`.claude/`, RVC E59); 4) più ricette proteiche (dolci) coi valori stimati.

## Stato (11/11 19:40 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice v?.
- ⚠️ **PT E69**: i push della #62 di `ricettario.js`, `opzioni.js`, `aiutante.js`, `style.css`, `ricette-stimate.js`, `tools/sito.py` hanno PUBBLICATO il sito (`sito.yml`) senza foto approvata né giro completo. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/ricettario.js | grep -c pagellaRic` → 5; `…/ricette-stimate.js` → 200. Giro completo dopo: 95/95 verde (#63).
- **C141 nell'app (online)**: Proteiche = ogni ricetta «ricca di proteine» (UE: ≥ 20 % delle calorie, ≥ 8 g; `fitRic` in `ricettario.js`), **pagella** `pagellaRic` (voto 1-10, semaforo proteine/calorie/saturi/zuccheri/sale in % del fabbisogno UE, proteine doppie), ordine per voto; soglie in `opzioni.js` (`fitEntraPerc`, `pagVerde`, `pagGiallo`, `fitProtPerc` = verde proteine, `fitProt` = pasto da, `fitSnackProt` = minimo); tolte `fitKcal/Saturi/Zuc/Sodio/SnackPerc/SnackZuc/SnackSodio`. `ricette-stimate.js` (207: Cookpad 135, blog GZ 28, YouTube 44; 114 dolci) → Proteiche 407 (147 dolci). Stimate: «≈ … stimati», niente «Ascolta», passi con link alla fonte.
- **Raccolta**: `python3 -I tools/raccogli_stimate.py` (cache `.cache-stime/` solo nel contenitore: rilanciarla rilegge i siti, ~1 h). YouTube con `YOUTUBE_API_KEY` (variabile d'ambiente, spazio in fondo → trim; solo nelle sessioni nuove). Scarti: 298 stima (ingredienti sconosciuti in `tools/stima.py`), 386 sotto il 20 %.
- Giro completo `node tools/prova.js` 95/95 verde nella #63 (due volte, l'ultima con `tools/prova.js` del commit 0a3d2ce0); C142 chiusa (PT E70). Verifica: `node tools/prova.js > f 2>&1; grep -c '^NO' f` → 0 (~4,5 min).
- **C143 difesa pronta ma SPENTA**: `docs/lavori-in-corso/c143-guardia.patch` (guardia: commit/push di file del sito sul ramo senza «[pubblica]» → fermo; 26 prove in `tools/test-guardia.py`, 146/146 verdi). Al «1» di Mario (DOMANDA 2): `git apply docs/lavori-in-corso/c143-guardia.patch && python3 -I tools/test-guardia.py`, commit, push. Verifica: `git apply --check` della patch passa.
- **C140**: il repo è PUBBLICO (`gh api -X GET search/repositories -f q='repo:Kur0ChanX/pronti-in-tavola' --jq '.items[0].visibility'`). Scelta 3 controllata (#64, docs.github.com 11/11): privato = 2.000 minuti/mese GitHub, motori di casa gratis; rami protetti non usati (`list_branches`: tutti `protected: false`); nessun file del codice legge il repo da GitHub; account personale = un motore per repo (secondo motore sul PC); Blacksmith qui non collegato. Note: `docs/lavori-in-corso/c140-giri-casa-blacksmith-github.md`.
- Il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs`, `tools/sito.py` pubblica da solo (`sito.yml`): codice non approvato = patch in `docs/lavori-in-corso/`, mai commit dei `.js`.
- C135 riserva accesa, C139 200 proteiche RicetteFit/GZ (righe vecchie: verifica `curl -s …/api/stato`). Sveglie: nessuna mia.
- Chat parallela **Salvagente 4** (C138, solo documenti): i suoi file non si toccano; la sua scorta non si unisce (E97).
- Kit: RVC ha il 38.18 pronto, non urgente.

## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#64)
- Avvio; orari della #63 scritti un'ora avanti corretti (PT E33) + controllo «orari di oggi nel futuro» in `tools/consegne.py controlla`; risposta a «come fa il progetto rvc» (solo in chat); C140 scelta 3 «privato + PC» controllata e chiesta (DOMANDA 1 riscritta).

## Sessione prima (#63)
- Scorta della #62 unita; giro completo 95/95; C142 chiusa (guida del primo avvio copriva la Home, PT E70) e timer delle prove con `.unref()`; C143 come patch (manca l'ok); C140: progetto pubblico, DOMANDA 1 🛑 e DOMANDA 2 (C143) mandate a Mario ~19:10.

## Strade provate e scartate (perché; così la prossima non le rifà)
- #64: scrivere nei file di questo repo come fa RVC (nomi di file e workflow di RVC) → fermato dal controllo della sessione: il repo è PUBBLICO e RVC è privato; i dettagli di RVC solo in chat.
- #63: C55 da sola → aspettare la fine del «vapore» dell'apertura NON basta (provato): la causa è `#guida`. C143 nei file `.claude/` → bloccato da RVC E59 (serve l'ok scritto di Mario): patch.
- #62: modulo sicuro per la chiave Google (`X-Goog-Api-Key`, anche minuscolo) → rifiutato dal servizio: solo variabile d'ambiente. Pagine dei video YouTube dal contenitore → controllo anti-robot: solo API. Valori di Pietrobon + nostri saturi → tutto scartato: saturi in proporzione ai suoi grassi. Regola stretta di prima sulle stimate → solo 69 su 1.112 candidate.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
1. Alla risposta sulle foto (C141): «1» → versione 0.10.24 con le novità (skill `pr`, commit con «[pubblica]» se C143 è accesa), chiudere C141 alla sua foto dall'app; «2» → cambiare quello che dice.
2. DOMANDA 2 «1» → applicare la patch C143 (vedi Stato), prova, commit, push; dirlo a Mario con la prova di un commit finto fermato.
3. DOMANDA 1 (C140): «1» → nel kit la regola «PC di casa solo per i progetti privati», qui niente; «2» → guida: Impostazioni → Actions → General «Require approval for all external contributors», poi motore; «3» (consiglio) → passi a mano a Mario (prima `docs/GUIDE-GIUSTE.md`, pulsanti controllati su docs.github.com): 1) Settings → General → Danger Zone → Change visibility → privato; 2) secondo motore sul PC NZXT per questo repo (Settings → Actions → Runners → New self-hosted runner, Windows, cartella sua, etichette `self-hosted` + `casa`); 3) io: `runs-on` con lavoro «scegli» (PC libero? sennò GitHub) in `sito.yml`/prove, e `tools/scegli-giro.py` col caso «casa» (kit 38.26 di RVC lo ha già: aggiornare il kit qui, 38.16, con l'ok di Mario per `.claude/`).
4. Più stimate (`tools/stima.py`, ingredienti sconosciuti) solo dopo il «1» sulle foto.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 12; 🛑 foto C141 e C140). Controllo Da fare: 0 voci aggiunte (19:10 «come fa il progetto rvc» = risposta in chat; 19:20 = C140 scelta 3).

## Ultimo messaggio di Mario
11/11 ~19:24 (arrivato nella #64 dopo l'handoff, passato alla #65), parola per parola: «hai aggiunto le ricette dello youtuber piú tutte quelle dette 500? ricette / 3 secondo me se sei d'accordo» → C140 = **3** (privato + PC di casa, poi GitHub: riga tolta da «Aspetta Mario»; partire dal punto 3 dei Prossimi passi, scelta «3»); domanda sulle ricette: rispondere coi numeri veri di `ricette-stimate.js` e Proteiche (207 stimate: Cookpad 135, blog 28, YouTube 44 → Proteiche 407) e cosa manca per arrivare a 500.
11/11 ~19:20, parola per parola: «se lo rendiamo privato e mettiamo il mio PC?» → C140 scelta 3, DOMANDA 1 riscritta (#64).
Prima: 19:10 «come fa il progetto rvc» → risposta in chat (#64); 19:06 «devi girare in priorita sul GitHub del mio pc nzxt a casa poi blacksmith poi github a comsumo gratuito» → C140.
Prima: 18:22 «nelle ricette aggiungile tutte quante e metti un voto…» → C141 (online, foto, 🛑).

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C145; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-11 19:24 · [AVVIO] Sessione #65 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → 
- 2026-11-11 19:33 · mettimi se puoi tutti i video delle ricette dello youtuber e metti le informazio… → 

Ultimo, intero:
> mettimi se puoi tutti i video delle ricette dello youtuber e metti le informazioni che hai in una sezione a parte esempio ricette video e dividi per il nome che dici? occupiamo teoppo spazio limiti ecc?

