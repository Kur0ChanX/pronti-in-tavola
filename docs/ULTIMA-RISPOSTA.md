# Ultima risposta di Claude (05/11/2026 08:48 ora italiana)

✅ FATTO
- Ho scritto le **regole di sicurezza** (chi può leggere e scrivere cosa): `firestore.rules`.
- Le ho provate nell'**emulatore** (un Firebase finto sul computer): 30 casi su 30 verdi (`npm run prova-regole`). Per esempio: un cliente vede solo i suoi ordini, non può cambiare un prezzo, non può segnare «Soldi ricevuti».
- Ho controllato che le prove sappiano bocciare. Con le regole tolte (tutto aperto) 23 casi su 30 falliscono, quindi le prove servono davvero.
- Tutto salvato su GitHub (commit `e2635b6`, uguale a quello online). Ho cambiato solo i file di Firebase: l'app non è stata …

## Domande a Mario

❓ DOMANDE
- Le due domande del messaggio di prima (come entra Monica, link del cliente) sono ancora aperte. Intanto vado coi consigli.
