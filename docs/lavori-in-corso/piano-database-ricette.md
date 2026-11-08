# Piano: database delle ricette sul server (C60)

Mario 08/11 ~09:05, parola per parola: «intendo le nuove ricette le cerca e le crea nel mio database ricette poi dalva le voci definitivamente per sempre quelle di Microsoft senza doppioni e ogni nuova ricetta caricata la scarica in automatico e la salva per sempre»

## Cosa vuole
1. Un database di ricette SUO (sul server, non solo sul telefono) che cresce da solo: il motore cerca le ricette nuove di GialloZafferano e le salva.
2. Le letture della voce Microsoft salvate per sempre, senza doppioni (stesso testo + stessa voce = una sola copia).
3. Ogni ricetta aperta o caricata: salvata per sempre in automatico.

## Strada scelta (#26)
- **Dove**: un Durable Object nuovo `Ricettario` con SQLite, nello stesso Worker (`worker.js`), come `Avvisi`. Gratis senza carta (piano gratuito: 5 GB, 100.000 righe scritte al giorno). Niente servizi nuovi, niente passi a mano per Mario. Migrazione `v2` in `wrangler.jsonc`: `{"tag": "v2", "new_sqlite_classes": ["Ricettario"]}` + binding `RICETTARIO`.
- **Tabelle**: `ricette(id PK, nome, categoria, foto, cerca, json, creata, aggiornata)` · `coda(url PK, aggiunta, tentativi)` · `voci(k PK = voce+sha256(testo), mp3 BLOB, creata)` · `stato(k PK, v)` (fonte e pagina a cui è arrivato il giro).
- **Salva per sempre**: `ricettaGz({u})` dopo la lettura fa `INSERT OR REPLACE` nel database (serve passare `env`). `/api/voce` guarda prima `voci`, se manca la crea e la salva (la cache di Cloudflare resta davanti).
- **Motore che cerca**: cron nuovo `*/10 * * * *` in `wrangler.jsonc` (in `scheduled` distinguere `ev.cron`). A ogni giro: se la coda ha meno di 20 voci, legge UNA pagina di una fonte (giro a rotazione: le sezioni di `CAT_GZ` + `ricette-regionali/Sardegna`, pagina dopo pagina con `gzProssima`) e mette in coda gli id che non ci sono; poi scarica 3 ricette dalla coda. Piano gratuito: 50 richieste esterne e ~10 ms di CPU per giro → pochi per volta (~400 ricette al giorno; tutto GialloZafferano in qualche settimana, solo testi ~10 KB l'una).
- **Voci**: NON tutte in anticipo (1 MB per ricetta × migliaia = oltre i 5 GB gratuiti); si creano alla prima lettura e restano per sempre. Per aumentare i riusi, in `leggiPasso` (ricettario.js) leggere «Passo N. testo» e la coda («di' avanti…») come due pezzi separati (parlaAI con un elenco di pezzi in fila).
- **App**: `/api/ricettario {cerca, cat, da}` → ricette dal database; `{stato}` → quante ricette, quante in coda, quante voci. Nel ricettario: sezione «🗄 Il tuo database: N ricette (cresce da solo)», la ricerca guarda anche nel database, chip «🗄 Database» con «Carica altre». Il telefono continua a scaricare per usarle senza rete (v0.9.25).

## Rischi
- CPU 10 ms del piano gratuito: lettura di una pagina di GialloZafferano con le regex = da misurare (`/api/gz` oggi funziona online). Se un giro supera, scendere a 1 ricetta per giro.
- Accesso Microsoft non ufficiale: se cambia, le voci già salvate restano.
- Niente prova possibile dal contenitore (GialloZafferano e Microsoft bloccati): prove con server finto + prova di Mario online.
