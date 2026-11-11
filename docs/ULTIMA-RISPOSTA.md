# Ultima risposta di Claude (11/11/2026 17:56 ora italiana)

Ho capito: dovevo solo controllare che la chiave YouTube funzioni e mandare l'esito alla chat principale.

✅ FATTO
- La variabile `YOUTUBE_API_KEY` c'è.
- Così com'è, la chiave **non** funziona: ha uno spazio o un "a capo" in più (40 caratteri invece di 39).
- Con una copia senza lo spazio funziona: la ricerca "pietrobon" trova il canale «Massimo Pietrobon gobbi».
- Ho mandato l'esito alla chat principale. La chiave non è mai comparsa in chiaro.

───
💡 PARERE
La strada più sicura sono due cose insieme. Il codice toglie da solo gli spazi in più quando legge la chiave: così anche un errore …
