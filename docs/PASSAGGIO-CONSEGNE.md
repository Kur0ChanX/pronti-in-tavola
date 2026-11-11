# Passaggio di consegne

Sessione attuale: #64 (dopo la #63 `session_01WTjqUvCWdASm6EXuq3bu3x`, chiusa 11/11 ~20:10 in attesa delle risposte, oltre 180k (C455); la apre la #63 con `create_session` (catena 3 di 8)).

- **Già deciso da Mario (non richiedere):** tutto in `docs/lavori-in-corso/gia-deciso-da-mario.md` (leggilo a blocchi con grep prima di ogni domanda). 10/11: Cloudflare NIENTE piano a pagamento e NIENTE blocchi alle persone, solo avvisi a Mario; C135 = «1» (anche i clienti, nessuno si riiscrive); 11/11: C139 regola dolci = «2» (snack prot ≥ 8 g, quota ≥ 20 %, zuccheri ≤ 30 %); Agent Reach NON si usa (#59: social, rischio, cookie); C137 = in emergenza il ricettario si ferma (ordini, menù, avvisi, clienti sempre).
- **Da non rifare:** sessioni 1-15 in `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md` (in fondo anche #16-#46). C136 (v0.10.17), C135 codice e C137 (v0.10.18), C139 (v0.10.19, #57) FATTE. Snellimento di `ERRORI.md` e `DA-FARE.md` FATTO dalla #55.
- **Cosa preme a Mario adesso (11/11 #63):** 1) 🛑 foto della pagella (C141, già ONLINE, PT E69): «1» = va bene, «2» = cosa cambiare; 2) 🛑 C140: Mario 20:06 «prima il PC NZXT di casa, poi Blacksmith, poi GitHub gratis» → DOMANDA 1 della #63 (progetto PUBBLICO: 1 qui solo GitHub, 2 anche qui il PC); 3) DOMANDA 2 della #63: ok per accendere la difesa C143 (`.claude/`, RVC E59); 4) più ricette proteiche (dolci) coi valori stimati.

## Stato (11/11 19:09 ora italiana)
- Ramo comune = origin (verifica: `git rev-parse HEAD` = `origin/claude/pronti-ramo-definitivo`). Nessun giro in corso. Nessuna PR aperta. Versione nel codice **0.10.23** (non alzata: aspetta il «1» sulle foto). Scorte NON unite: scorta-principale-20261111-01WTjqUvCWdA/claude/pronti-ramo-definitivo.
- ⚠️ **PT E69**: i push della #62 di `ricettario.js`, `opzioni.js`, `aiutante.js`, `style.css`, `ricette-stimate.js`, `tools/sito.py` hanno PUBBLICATO il sito (`sito.yml`) senza foto approvata né giro completo. Verifica: `curl -s https://pronti-in-tavola.pronti-in-tavola.workers.dev/ricettario.js | grep -c pagellaRic` → 5; `…/ricette-stimate.js` → 200. Giro completo dopo: 95/95 verde (#63).
- **C141 nell'app (online)**: Proteiche = ogni ricetta «ricca di proteine» (UE: ≥ 20 % delle calorie, ≥ 8 g; `fitRic` in `ricettario.js`), **pagella** `pagellaRic` (voto 1-10, semaforo proteine/calorie/saturi/zuccheri/sale in % del fabbisogno UE, proteine doppie), ordine per voto; soglie in `opzioni.js` (`fitEntraPerc`, `pagVerde`, `pagGiallo`, `fitProtPerc` = verde proteine, `fitProt` = pasto da, `fitSnackProt` = minimo); tolte `fitKcal/Saturi/Zuc/Sodio/SnackPerc/SnackZuc/SnackSodio`. `ricette-stimate.js` (207: Cookpad 135, blog GZ 28, YouTube 44; 114 dolci) → Proteiche 407 (147 dolci). Stimate: «≈ … stimati», niente «Ascolta», passi con link alla fonte.
- **Raccolta**: `python3 -I tools/raccogli_stimate.py` (cache `.cache-stime/` solo nel contenitore: rilanciarla rilegge i siti, ~1 h). YouTube con `YOUTUBE_API_KEY` (variabile d'ambiente, spazio in fondo → trim; solo nelle sessioni nuove). Scarti: 298 stima (ingredienti sconosciuti in `tools/stima.py`), 386 sotto il 20 %.
- Giro completo `node tools/prova.js` 95/95 verde nella #63 (due volte, l'ultima con `tools/prova.js` del commit 0a3d2ce0); C142 chiusa (PT E70). Verifica: `node tools/prova.js > f 2>&1; grep -c '^NO' f` → 0 (~4,5 min).
- **C143 difesa pronta ma SPENTA**: `docs/lavori-in-corso/c143-guardia.patch` (guardia: commit/push di file del sito sul ramo senza «[pubblica]» → fermo; 26 prove in `tools/test-guardia.py`, 146/146 verdi). Al «1» di Mario (DOMANDA 2): `git apply docs/lavori-in-corso/c143-guardia.patch && python3 -I tools/test-guardia.py`, commit, push. Verifica: `git apply --check` della patch passa.
- **C140**: il repo è PUBBLICO (`gh api -X GET search/repositories -f q='repo:Kur0ChanX/pronti-in-tavola' --jq '.items[0].visibility'`): GitHub gratis senza tetto, il PC di casa = rischio fork. Note: `docs/lavori-in-corso/c140-giri-casa-blacksmith-github.md`.
- Il push di `*.js`, `*.css`, `*.html`, `wrangler.jsonc`, `*.mjs`, `tools/sito.py` pubblica da solo (`sito.yml`): codice non approvato = patch in `docs/lavori-in-corso/`, mai commit dei `.js`.
- C135 riserva accesa, C139 200 proteiche RicetteFit/GZ (righe vecchie: verifica `curl -s …/api/stato`). Sveglie: nessuna mia.
- Chat parallela **Salvagente 4** (C138, solo documenti): i suoi file non si toccano; la sua scorta non si unisce (E97).
- Kit: RVC ha il 38.18 pronto, non urgente.

## Riferimenti
- C141: `docs/lavori-in-corso/c141-proteiche-stimate.md` (parole di Mario, specifica, stato). Foto: `archivio/foto/2026-11-11-1930-c141-pagella-*.png`.
- Decisioni: `docs/SPECIFICA.md`. Lavori: `docs/DA-FARE.md`. Regole: `.claude/rules/progetto.md`, `.claude/rules/prove.md`.

## Sessione appena chiusa (#63)
- Scorta della #62 unita; giro completo 95/95; C142 chiusa (guida del primo avvio copriva la Home, PT E70) e timer delle prove con `.unref()`; C143 come patch (manca l'ok); C140: progetto pubblico, DOMANDA 1 🛑 e DOMANDA 2 (C143) mandate a Mario ~20:10.

## Sessione prima (#62)
- Chiave YouTube (PT E68); C141 regola larga + pagella + 207 stimate ONLINE senza ok (PT E69); foto mandate.

## Strade provate e scartate (perché; così la prossima non le rifà)
- #63: C55 da sola → aspettare la fine del «vapore» dell'apertura NON basta (provato): la causa è `#guida`. C143 nei file `.claude/` → bloccato da RVC E59 (serve l'ok scritto di Mario): patch.
- #62: modulo sicuro per la chiave Google (`X-Goog-Api-Key`, anche minuscolo) → rifiutato dal servizio: solo variabile d'ambiente. Pagine dei video YouTube dal contenitore → controllo anti-robot: solo API. Valori di Pietrobon + nostri saturi → tutto scartato: saturi in proporzione ai suoi grassi. Regola stretta di prima sulle stimate → solo 69 su 1.112 candidate.
- #60 e prima: vedi la sezione nelle consegne vecchie (`git log -p docs/PASSAGGIO-CONSEGNE.md`) e `docs/lavori-in-corso/da-non-rifare-sessioni-1-15.md`.

## Prossimi passi
1. Alla risposta sulle foto (C141): «1» → versione 0.10.24 con le novità (skill `pr`, commit con «[pubblica]» se C143 è accesa), chiudere C141 alla sua foto dall'app; «2» → cambiare quello che dice.
2. DOMANDA 2 «1» → applicare la patch C143 (vedi Stato), prova, commit, push; dirlo a Mario con la prova di un commit finto fermato.
3. DOMANDA 1 (C140): «1» → nel kit la regola «PC di casa solo per i progetti privati», qui niente; «2» → guida a Mario: Impostazioni → Actions → General «Require approval for all external contributors», foto dei Runners, poi lavoro «scegli» (chiave di sola lettura dei motori) in `sito.yml` e `pulisci-scorte.yml`.
4. Più stimate (`tools/stima.py`, ingredienti sconosciuti) solo dopo il «1» sulle foto.

## Domande aperte
- Tutte in «## 0. Aspetta Mario» di `docs/DA-FARE.md` (della principale: 12; 🛑 foto C141 e C140). Controllo Da fare: 0 voci aggiunte (la richiesta 20:06 è in C140).

## Ultimo messaggio di Mario
11/11 ~20:06, parola per parola: «devi girare in priorita sul GitHub del mio pc nzxt a casa poi blacksmith poi github a comsumo gratuito» → C140, DOMANDA 1 (progetto pubblico).
Prima: 18:22 «nelle ricette aggiungile tutte quante e metti un voto…» → C141 (online, foto, 🛑).

## Numeri liberi
Prossimo E libero: E1; prossimo C libero: C144; prossimo M libero: M1.

## Motore e forza di pensiero
Motore: **claude-opus-5-5** (Opus 5.5) · impegno **Extra** (`xhigh`, dal registro della sessione): la sessione nuova nasce con questi (C474, `create_session` con `model` ed `effort`), mai chiesti a Mario (E277).

## Messaggi di Mario di questa sessione
Scritti dallo script (C469): dopo «→» cosa ne è stato (C…, file, commit o «risposta alla domanda N»).
- 2026-11-11 18:52 · [AVVIO] Sessione #63 di Pronti in Tavola (repo Kur0ChanX/pronti-in-tavola, ramo … → avvio, scorta unita, giro 95/95, C142, C143 patch
- 2026-11-11 19:06 · devi girare in priorita sul GitHub del mio pc nzxt a casa poi blacksmith poi git… → C140, DOMANDA 1

Ultimo, intero:
> devi girare in priorita sul GitHub del mio pc nzxt a casa poi blacksmith poi github a comsumo gratuito

