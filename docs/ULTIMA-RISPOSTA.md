# Ultima risposta di Claude (10/11/2026 17:41 ora italiana)

Ho capito: niente riga nella Home («2»). Chiedi se c'è un modo per far suonare gli avvisi degli ordini anche col server bloccato.

**Sì, c'è uno stratagemma: la «corsia d'emergenza».**
- Cloudflare ha bloccato solo la **memoria** del server (Durable Objects), non il server: stasera risponde, ma non può leggere dove tiene chiavi e telefoni iscritti.
- Cloudflare ha un secondo magazzino gratuito, **Workers KV** (memoria semplice chiave → valore), con un limite tutto suo: 100 mila letture al giorno ([limiti ufficiali, novembre 2026](https://developers.cloudflare.com/kv/platform/limits/)).
- …

## Domande a Mario

❓ **DOMANDE**
1. 📌 **Di cosa parliamo:** oggi, se Cloudflare blocca la memoria del server, il telefono di Monica non suona per gli ordini nuovi fino a notte. Con la corsia d'emergenza suona lo stesso.
   - 1 · La faccio subito (consiglio): la fa la sessione nuova, perché questa è quasi piena. Forse è pronta prima delle 01:00, ma è una stima.
   - 2 · Domani con calma: stanotte alle 01:00 il server riparte da solo.

   A cosa serve: Monica non perde ordini se il blocco ricapita.
