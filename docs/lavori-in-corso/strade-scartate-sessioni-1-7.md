# Strade provate e scartate (sessioni 1-7)

Spostate qui dalle consegne della #8 (tetto di parole). Da leggere prima di riproporre una di queste idee.

- Link personale per cliente + link «richiesta»: Mario vuole UN link che tutti rigirano.
- Accesso di Monica via email-link: solo 5 email al giorno sul piano gratis.
- Leggere `nomi/` dal telefono per sapere se il nome c'è: permetterebbe di scoprire chi è cliente; il telefono prova a scrivere e il rifiuto dice «nome già usato».
- Nuovi che prendono i pronti o le teglie: un link girato in un gruppo potrebbe bloccare i piatti; li prende Monica all'approvazione.
- Due ordini nella stessa scrittura: le regole vogliono il contatore +1 per scrittura → una transazione per ordine.
- Approvare con le scritture normali di Monica (S confrontato col server, a lotti): non è «tutto o niente» e con l'ultimo pronto conteso si potrebbe andare sotto zero; scelta la transazione con l'annulla inverso.
- Lucchetto anche nella versione di prova: nell'anteprima (riquadro di claude.ai) WebAuthn non è permesso e cadrebbe sempre in «senza blocco schermo»; le schermate si mostrano con le foto.
- Mettere la chiave senza Google quando manca (dati del sito cancellati a metà): chiunque col telefono potrebbe metterne una sua; serve l'entrata fresca o «Entra di nuovo con Google».
- Bloccare le scritture di Monica finché non arriva il server (scelta della #5): le modifiche fatte senza rete si perdevano; la coda di Firestore le tiene anche ad app chiusa.
- Pronti e teglie scritti come numero: Monica con la copia vecchia rimetteva i pronti già presi dai clienti; scelta la differenza (`increment`), con la base aggiornata dopo ogni scrittura.
- Ascoltare la raccolta `foto/`: dopo 30 minuti fuori Firestore rimanda tutte le foto (fino a 7 MB per apertura) e i 10 GiB gratis del mese possono finire; scelta la versione nel piatto.
- Service worker con «prima la copia» per i file dell'app: le novità arriverebbero solo alla seconda apertura; scelta «prima la rete», copia dopo 3 secondi.
- Configurazione vera di Firebase anche nell'anteprima di prova: il riquadro di claude.ai si collegherebbe ai dati veri; scelta `FIREBASE_CONFIG = null` nell'anteprima (`tools/anteprima.py`).
- Gemini in Firebase acceso («azione consigliata»): non serve (il codice lo scrivo io) e può usare i prompt per addestrarsi; spento.
- Guide giuste dentro ogni documento del servizio: un file solo, `docs/GUIDE-GIUSTE.md`, vale per Firebase, Cloudflare, GitHub.
- Guida per Firebase a memoria o solo dalla guida ufficiale: la console di Mario aveva un pulsante diverso; prima `docs/GUIDE-GIUSTE.md`, poi la guida ufficiale con la data, e chiedere una foto al primo passo.
