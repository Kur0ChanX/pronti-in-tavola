# Pronti in Tavola 🍝 · regole del progetto
@docs/kit-progetto/REGOLE.md

Sopra il kit (uguale in tutti i progetti, versione in `docs/kit-progetto/VERSIONE`); qui solo il progetto, che nei dettagli vince. Tetto: ~1.000 token (lo controllano `tools/fai-kit.py` e l'hook `kit-check.py`).
- Repo `Kur0ChanX/pronti-in-tavola`, ramo unico **`claude/pronti-ramo-definitivo`** (`.claude/ramo-di-lavoro.txt`). Titoli `<segno> 🍝 <Nome> <numero> · <cosa fa>` (es. «🟢 🍝 Principale 12 · scegli fornitore»; catene in `docs/CHI-FA-COSA.md`; REGOLE.md «Titoli»). Altri progetti di Mario: nessuno (progetto indipendente: «nessuno», e non nominarli mai).
- Il resto quando serve: skill del kit (`consegne` 🔒, `chat-parallela`, `cambio-account` 🔒, `pr`, `nuova-regola`, `ricerca-aggiornata`); regole per zona in `.claude/rules/` (con `paths:`): se lavoro in una zona solo con Bash, prima le leggo.

## App con prove
- Anteprima: https://claude.ai/artifact/MnsfrjTda3bwZscbgER3EH (si rifà con `python3 -I tools/anteprima.py`, poi publish di `dist/anteprima.html`). Sito vero in arrivo: `pronti-in-tavola.pages.dev`.
- Prove: `node tools/prova.js` (Playwright, telefono `Pixel 7`), dopo `python3 -I tools/anteprima.py`. Regole dell'app (semplicità, offline, «salvato» solo con la conferma del server) in `.claude/rules/progetto.md`.

## Compact instructions
Se il contesto viene compresso, conserva: l'ultimo messaggio di Mario parola per parola; le domande aperte; i file toccati con i percorsi; le decisioni con il motivo; il punto esatto del lavoro e il prossimo passo.

---
# Pronti in Tavola
App per **Monica** (sorella di Mario): cucina in casa a Olbia e vende da asporto ad amici. I clienti aprono il link da WhatsApp, ordinano e ritirano; Monica gestisce ordini, piatti, clienti e impostazioni. Tutto semplicissimo: Monica e i clienti non sono pratici.
- Codice: `index.html`, `style.css`, `data.js` (menù e dati iniziali), `app.js` (logica; solo `carica()`/`salva()` toccano i dati). Immagini in `media/`. Niente framework.
- Stato: v0.7 di prova, dati solo sul telefono (localStorage). Prossimo: dati veri con Firebase, poi notifiche, sito su Cloudflare Pages.
- Documenti: `docs/SPECIFICA.md` (decisioni), `docs/PASSAGGIO-CONSEGNE.md` (stato e prossimi passi), `docs/DA-FARE.md`, `docs/ERRORI.md`.
