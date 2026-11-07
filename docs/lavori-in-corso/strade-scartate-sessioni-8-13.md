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
