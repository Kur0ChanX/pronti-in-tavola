# Ultima risposta di Claude (11/11/2026 17:50 ora italiana)

Ho capito: la metti tu nell'ambiente. Va bene, è la strada giusta.

💡 Una cosa conta: **dove** la metti.
- **«Network secrets»** (meglio): Host `www.googleapis.com` · Header `X-Goog-Api-Key` · Prefisso vuoto. Funziona subito, anche in questa sessione.
- Se quella sezione non c'è, mettila come **variabile d'ambiente** (un valore con un nome, che l'app legge all'avvio): nome `YOUTUBE_API_KEY`. In quel caso la vede solo una sessione nuova.

Poi scrivi «fatto» e la provo.
