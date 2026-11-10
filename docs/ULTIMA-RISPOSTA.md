# Ultima risposta di Claude (10/11/2026 17:44 ora italiana)

Ho capito: vuoi sapere com'è fatta la corsia d'emergenza, quanto regge con i numeri veri e se avvisa anche i clienti.

**Com'è fatta**
- Oggi chiavi degli avvisi e telefoni iscritti stanno solo nella memoria del server che Cloudflare ha bloccato.
- La corsia d'emergenza ne tiene una **copia** in Workers KV, un secondo magazzino gratuito di Cloudflare con un limite tutto suo.
- Se la memoria si blocca, il server prende chiavi e telefoni dalla copia e manda l'avviso lo stesso.

**Quanto regge (calcolo, quindi stima)**
- KV gratis: 100 mila letture al giorno. Ogni avviso ne usa 1-2.
- Bastano …

## Domande a Mario

❓ **DOMANDE**
1. 📌 **Di cosa parliamo:** la corsia d'emergenza fa partire gli avvisi anche se Cloudflare blocca di nuovo la memoria. Va fatta dopo l'01:00, per copiare chiavi e telefoni senza far iscrivere di nuovo nessuno.
   - 1 · Per tutti, anche i clienti (consiglio): «Ordine pronto» e «Altro giorno» arrivano sempre.
   - 2 · Solo tu e Monica.
   - 3 · Non farla.

   A cosa serve: nessun avviso perso se il blocco ricapita.

Il giro delle prove ha 90 verdi su 90: pubblico le Notifiche appena chiude.
