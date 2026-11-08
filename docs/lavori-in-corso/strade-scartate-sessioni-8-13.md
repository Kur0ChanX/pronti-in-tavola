# Strade scartate (sessioni 8-13)

Spostate qui dalle consegne della #13 per tenerle snelle.

- «Accetta» in due tocchi (prima «Ripensaci» che rimanda tra i Nuovi, poi Sì): scartata, Monica ha già sbagliato una volta; un tocco solo.
- Database Firestore in «modalità di test»: si blocca dopo 30 giorni e intanto è aperto a tutti; scelta la produzione con le nostre regole. Piano Blaze (backup): a pagamento, no.
- Cloudflare con un token API per pubblicare io: un segreto in più; scelto il collegamento con GitHub (Mario autorizza solo questo repo).
- Sito su `main`: il ramo non esiste; per ora il sito di prova segue il ramo di lavoro (nessun cliente ha il link), `main` con PR e prove verdi prima di darlo ai clienti.
- Cloudflare con l'email alias `mario.miscera+pronti@gmail.com`: rifiutata da Cloudflare (05/11 20:28, «Only one variation is allowed»); scelta l'account Free aggiuntivo dallo stesso login.
- Dosi dentro i piatti (`S.piatti`): scartato, con Firebase i piatti li legge chiunque e le dosi sono solo di Monica; per ora `localStorage` `pit-spesa-v1`, poi raccolta privata (C15).
- Spiegare «lista Hai detto di no» senza esempio: Mario non l'ha capita (PT E7).
- Rilettura dello stato del cliente con limite di 2 s che salta le chiamate: perdeva il «No» dopo Accetta + Annulla ravvicinati; ora la rilettura va in coda.
- Spesa con «in casa» che si scala davvero a ogni «pronto»: scartato, un Annulla non lo rimetterebbe; scelto il calcolo (`SPESA.cotti`).
- Push di `main` da sola: bloccato dal permesso automatico; resta a Mario/insieme quando c'è Cloudflare.
- Cloudflare «Connetti GitHub» (Pages, Worker → Compilazioni → GitHub, flusso «Connect GitHub» nuovo): torna sempre a `github.com/settings/installations` senza registrare, da telefono E da PC. Probabile: Kur0ChanX già legato all'altro account Cloudflare. Disinstallare l'autorizzazione toccherebbe gli altri progetti: no. Scelto «Crea token» + GitHub Actions.
- Dare la colpa al browser del telefono: smentito dal video dal PC (PT E10).
- Link `dash.cloudflare.com/?to=/:account/...` dal telefono: portano alla scelta dell'account e poi alla Home, non alla pagina.
- Stampantina termica Niimbot B1 (50×30, bianco e nero) per le etichette: fatta e tolta, Mario vuole il colore. Stampante a serbatoi (Epson EcoTank ET-2870 ~180-210 €) proposta, non decisa: «solo A4 per ora».
- Dire «sbagliato» a una foto senza spiegare dove va ogni casella: 3 giri persi (PT E12).

## Spostate dalle consegne della #23
- `color-scheme: only light` contro il modo scuro di Samsung Internet: non basta (PT E19).
- Vapore: sfondo scuro bordeaux (Mario: «non mi convince»), vapore crema su crema (invisibile), nuvole sommate con `lighter` (macchia bianca piatta), «nebbia che si apre» e «coperchio» (Mario: «non nebbia ma vapore di cottura»). Tenuto: batuffoli irregolari sovrapposti normali, a ondate.
- Aiutante AI: Anthropic a pagamento (Mario vuole gratis), Gemini API gratuita (account Google a parte, dati usati per addestrare), Groq (account in più). Tenuto Workers AI: stesso account Cloudflare dell'app, 10.000 neuroni/giorno ≈ 500 richieste.
