# Ultima risposta di Claude (10/11/2026 18:11 ora italiana)

Ho capito: vuoi sapere come funziona la corsia d'emergenza degli avvisi (C135) e quando arriva.
🧠 Opus · Extra

**Come funziona**
1. Oggi le chiavi delle notifiche e l'elenco dei telefoni iscritti stanno in un posto solo: la memoria del server. È quella che Cloudflare ha bloccato.
2. Aggiungo una **copia di scorta** in **Workers KV**. È un secondo archivio di Cloudflare, gratis, con un limite suo: 100 mila letture al giorno.
3. Quando arriva un ordine, o Monica sposta una consegna, il server prova la strada normale. Se la memoria è bloccata, manda l'avviso usando la copia di scorta.
4. …
