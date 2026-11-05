# Cambio account: i 3 passi di Mario (kit 27.2)

Solo Mario può farli. Tutto il resto (consegne, push, titoli) lo fa la sessione che chiude.
Titolo e testo «[AVVIO]» della sessione nuova sono sempre su GitHub, in `docs/PROSSIMA-SESSIONE.md` del progetto (repo e ramo nel suo `CLAUDE.md`).
Nomi dei pulsanti presi dalle pagine di aiuto di Claude (lette il 23/10/2026): la finestra può cambiare un po' da account ad account.

## 1. Preferenze nel profilo
Perché: arrivano in tutte le chat e in tutte le sessioni di quell'account (come parlarti, domande, prove).
1. Apri https://claude.ai/settings/general
2. Trova il riquadro delle preferenze personali e cancella tutto quello che c'è.
3. Incolla il testo INTERO di `docs/kit-progetto/PREFERENZE-CHAT.txt` (su GitHub, o dal riquadro che ti dà la sessione).
4. Salva. La prima riga deve dire la versione (es. «v27 · 23/10/2026 · …»).

## 2. Parallel Search nella chat (ricerca sul web aggiornata, gratis, senza chiave)
Perché: nelle chat normali Claude cerca con Parallel; nelle sessioni dei progetti c'è già da `.mcp.json`.
1. Apri https://claude.ai e vai in **Customize** → **Connectors**.
2. Premi **+ Add** (o **+**), poi **Add custom connector**.
3. Nome: `Parallel Search`. Indirizzo del server:
   ```
   https://search.parallel.ai/mcp
   ```
4. Premi **Continue**. Se chiede come entrare, scegli **No sign in** (non serve una chiave).
5. Premi **Add**.
- Rischio: le domande escono verso Parallel; Claude non ci mette mai nomi, chiavi o dati dei progetti.

## 3. Aprire la sessione nuova
Di solito la apre Claude da sola (`create_session`). Tocca a te solo a 8 sessioni di fila, al cambio account o se Claude te lo dice.
1. Apri su GitHub `docs/PROSSIMA-SESSIONE.md` del progetto: dentro ci sono repo, ramo, motore, impegno, titolo e testo «[AVVIO]».
2. Apri https://claude.ai/code e scegli repo e ramo scritti nel file; motore e impegno come dice il file.
3. Incolla il testo «[AVVIO]» e invia. La sessione si dà da sola il titolo scritto nel file.

## Solo la prima volta su un account nuovo
- **GitHub collegato** (senza, le sessioni non leggono e non salvano i progetti): apri https://claude.ai/connect-github e premi **Connect** (o **Authorize**) con l'utente GitHub giusto; poi installa l'app «Claude» sui repository dei progetti: https://github.com/apps/claude/installations/select_target → scegli il proprietario → **All repositories** (o solo quelli dei progetti) → **Install** (se c'è già: **Configure** e controlla le spunte).
- **Rete per npm** nell'ambiente cloud (senza, prove e costruzione dell'app non partono): alla prima sessione Claude lo controlla da solo e, se manca, ti dice dove cambiarlo.
- **Prova finale**: all'avvio Claude dice la versione del kit («Kit 27.3 …») senza «ATTENZIONE»; se dice che le Preferenze sono più vecchie, rifai il passo 1.
