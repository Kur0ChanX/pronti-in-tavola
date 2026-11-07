# Pronti in Tavola 🍝 · regole del progetto
@docs/kit-progetto/REGOLE.md

Sopra il kit (uguale in tutti i progetti, versione in `docs/kit-progetto/VERSIONE`); qui solo il progetto, che nei dettagli vince. Tetto: ~1.000 token (lo controllano `tools/fai-kit.py` e l'hook `kit-check.py`).
- Repo `Kur0ChanX/pronti-in-tavola`, ramo unico **`claude/pronti-ramo-definitivo`** (`.claude/ramo-di-lavoro.txt`). Titoli `<segno> 🍝 <Nome> <numero> · <cosa fa>` (catene in `docs/CHI-FA-COSA.md`). Altri progetti di Mario: nessuno (progetto indipendente: «nessuno», e non nominarli mai).
- Guide a mano e servizi (Firebase, Cloudflare, GitHub…): ogni volta che se ne parla, anche per una domanda di Mario, leggo prima `docs/GUIDE-GIUSTE.md`; se una guida si scopre sbagliata, scrivo lì subito quella giusta (come l'ha vista Mario), commit e push. Foto di un sito da Mario: pagina e pulsanti esatti in `docs/GUIDE-GIUSTE.md` (foto in `archivio/foto/`), solo le pagine nuove.
- **Link a Mario**: cliccabile e, subito sotto, lo stesso in un riquadro di codice (dal telefono il tocco non fa copiare; Mario 07/11, scelta 3). Vince su «mai nei riquadri» delle skill `domande` e `ricerca-aggiornata`.
- Il resto quando serve: skill del kit (`consegne` 🔒, `chat-parallela`, `cambio-account` 🔒, `pr`, `nuova-regola`, `ricerca-aggiornata`); regole per zona in `.claude/rules/` (con `paths:`): se lavoro in una zona solo con Bash, prima le leggo.

## App con prove
- Anteprima: https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH (`python3 -I tools/anteprima.py` → `dist/anteprima.html`).
- Prove: `node tools/prova.js` (telefono `Pixel 7`) dopo l'anteprima. Regole dell'app in `.claude/rules/progetto.md`.

## Compact instructions
Alla compressione conserva: ultimo messaggio di Mario parola per parola, domande aperte, file toccati, decisioni col motivo, punto esatto e prossimo passo.

---
# Pronti in Tavola
App per **Monica** (sorella di Mario): cucina a Olbia e vende da asporto ad amici, che ordinano dal link WhatsApp. Semplicissima: Monica e i clienti non sono pratici.
- Codice: `index.html`, `style.css`, `data.js`, `app.js` (solo `carica()`/`salva()` toccano i dati), `spesa.js` (lista della spesa), `media/`. Niente framework.
- Stato: v0.7 di prova, dati sul telefono. Decisioni in `docs/SPECIFICA.md`, lavori in `docs/DA-FARE.md`.
