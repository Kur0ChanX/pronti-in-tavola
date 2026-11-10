---
name: ricerca-aggiornata
description: Ricerca di cose che cambiano (prodotti e hardware, versioni, prezzi, limiti gratuiti, servizi, notizie) con Context7, Parallel Search e WebSearch, fonti datate. Usala prima di rispondere a memoria su qualcosa che può essere cambiato.
---

# Ricerca aggiornata

Mai a memoria su cose che cambiano: la memoria di Claude ha una data, i servizi no.

## Quale strumento
1. **Manuali di librerie, framework, SDK, CLI** → Context7 (MCP `context7`): prima `resolve-library-id`, poi `query-docs`.
2. **Tutto il resto** (hardware, prodotti, prezzi, limiti, servizi, notizie, confronti) → Parallel Search: il connettore dell'account («Parallel_Search», strumenti `mcp__<codice>__web_search` e `…__web_fetch`, da caricare con ToolSearch «parallel web_search»); da kit 38.3 non è più anche in `.mcp.json` (C469 L7: era doppio). Se manca: WebSearch e una riga a Mario («aggiungi il connettore Parallel: `docs/kit-progetto/CAMBIO-ACCOUNT.md` passo 2»).
   - `web_search`: un `objective` preciso e 2-3 `search_queries` corte nella stessa chiamata; più obiettivi indipendenti = più chiamate insieme. Gli estratti di solito bastano.
   - `web_fetch`: solo per parole esatte o una pagina intera; più indirizzi con lo stesso obiettivo in una chiamata; `full_content` solo se serve davvero (costa molti token).
   - Lo stesso `session_id` (un codice a caso, es. un UUID) per tutte le chiamate della conversazione: serve ai limiti gratuiti.
3. **Parallel non risponde o limite raggiunto** → raggruppo le domande e riprovo una volta; poi WebSearch (`mode` «standard»; «extended» solo se il risultato è scarso o vecchio).

## Fonti
- Prima le fonti ufficiali (documentazione, blog o pagina prezzi del servizio), con la data della pagina. Due fonti in disaccordo: lo dico.
- Nella ricerca il mese e l'anno di oggi (es. «limiti gratuiti Firestore novembre 2026») e le uscite recenti (modelli nuovi, ultime versioni): un risultato vecchio non basta.
- A Mario: il link da aprire intero e cliccabile (mai in un riquadro di codice; un link da copiare sì, in un riquadro), la data dei dati e cosa dice in una riga. Quello che è stima lo chiamo stima.

## Privacy
- Le domande escono verso un servizio esterno: mai nomi di ospiti, colleghi o clienti, chiavi, password, indirizzi interni o dati veri del progetto. Domande generiche («limiti gratuiti Firestore 2026»), mai dati.

## Costo e rischio
- Context7: gratis. Parallel Search senza chiave: gratis, con limiti di uso più bassi; una chiave (account Parallel) serve solo per limiti alti e non va mai nel repo.
