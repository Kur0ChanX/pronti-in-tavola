# Pronti in Tavola 🍝 · regole del progetto
@docs/kit-progetto/REGOLE.md

Sopra il kit (versione in `docs/kit-progetto/VERSIONE`); qui solo il progetto, che nei dettagli vince. Tetto ~1.000 token (hook `kit-check.py`).
- Repo `Kur0ChanX/pronti-in-tavola`, ramo unico **`claude/pronti-ramo-definitivo`**. Titoli `<segno> 🍝 <Nome> <numero> · <cosa fa>` (catene in `docs/CHI-FA-COSA.md`). Altri progetti di Mario: nessuno (mai nominarli).
- Servizi (Firebase, Cloudflare, GitHub…): prima `docs/GUIDE-GIUSTE.md`; guida sbagliata → lì la giusta coi pulsanti esatti, subito.
- Skill del kit quando serve; regole per zona in `.claude/rules/` (`paths:`): lavorando in una zona solo con Bash, prima le leggo.

## App con prove
- Anteprima `python3 -I tools/anteprima.py` (solo prove, **niente artefatto**: Mario prova sul sito vero); prove `node tools/prova.js` (`Pixel 7`); regole dell'app in `.claude/rules/progetto.md`.

## Regime leggero (Mario 08/11)
Vince sul kit nei dettagli; regole 🔒 e divieti restano.
- Avvio: `docs/ERRORI.md`, «0. Aspetta Mario», «Prossimi passi»; il resto di Da fare con `grep`.
- Comandi raggruppati solo se sicuri (letture, cambio + sintassi, fetch/merge/push); prove poi commit (E20).
- Prove: mentre lavoro solo il pezzo (`SOLO=<parola>`); giro completo una volta prima del push di codice.
- Foto a Mario solo se cambia l'aspetto.

## Compact instructions
Conserva: ultimo messaggio di Mario parola per parola, domande aperte, file toccati, decisioni col motivo, punto esatto e prossimo passo.

---
# Pronti in Tavola
App per **Monica** (sorella di Mario): cucina a Olbia, vende da asporto ad amici che ordinano dal link WhatsApp. Semplicissima: Monica e i clienti non sono pratici.
- Codice: `app.js` (solo `carica()`/`salva()` toccano i dati), `data.js`, `ricettario.js`, `aiutante.js`, `spesa.js`, `worker.js` (server Cloudflare). Niente framework. Dati su Firebase (`dati.js`); decisioni in `docs/SPECIFICA.md`.
