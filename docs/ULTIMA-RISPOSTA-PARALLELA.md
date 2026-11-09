# Ultima risposta di Claude (09/11/2026 19:28 ora italiana)

Ho capito: sono Voce 5. Devo far capire bene il microfono dei clienti (sul tuo iPad scriveva «persa a Mato» invece di «per sabato»), poi rispondere sul motore locale (C108) e togliere i blocchi per cliente (C109).

**Cosa farò:**
1. Il server ascolta con due motori insieme: **Whisper** di Groq nella versione più precisa e quello di Cloudflare. **Whisper** è il programma che trasforma la voce in testo. Poi un **correttore** rimette a posto le parole sentite male usando i nomi del menù. Il correttore è un'AI veloce che corregge solo la frase, per esempio «Dette di lasagne» diventa «Due teglie …

## Domande a Mario

❓ **DOMANDE**
1. **C108, motore locale:**
   1) niente per ora, restano i tre motori sul server *(consiglio)*
   2) un motore piccolo (40-70 MB) solo di riserva, quando i server finiscono: capisce peggio
   3) un motore grande (240-540 MB) sempre: preciso, ma pesante per i clienti
2. **C109, tetto di tutta l'app:** oggi sono 400 ascolti al giorno, poi l'app dice «scrivimi la frase».
   1) lo porto a 1.500, con un avviso a te quando arriva a 1.000 *(consiglio)*
   2) resta 400
   3) nessun tetto: ci si ferma solo quando finiscono i limiti gratuiti dei servizi

   Finché non rispondi resta 400.
