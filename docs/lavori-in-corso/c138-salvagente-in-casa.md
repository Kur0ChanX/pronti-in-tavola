# C138 · Salvagente in casa (i PC di Mario come riserva di Cloudflare e Firebase)

Stato (Salvagente 2, 10/11 19:02): ricerca, proposta e confronto fra la 1 e la 2 con gli schemi mandati, **niente codice**. Aspetta la scelta di Mario (riga 🛑 in «## 0. Aspetta Mario» di `docs/DA-FARE.md`). Dopo la scelta: specifica qui sotto e piano a pezzi (skill `fable-opus`).

## Parole di Mario (10/11 18:30, intere)
> avvia plane mode pensiero profondo brain storming
>
>
> Volevo farti una domanda, siccome sto creando, cioè non è che sto creando, sto mettendo il motore di GitHub sul computer per fare le verifiche delle applicazioni senza che mi consumano minuti, cioè quindi lo sto facendo solo in locale, volevo chiederti se è possibile di se posso creare una sorta di, nel mio computer fisso sempre acceso, una sorta di Claude Flare per quando finisco i limiti. Volevo chiederti per quello, per Claude Flare e poi per Firebase. Volevo capire se è possibile creare dei server nel mio PC sicuri, non hackerabili o difficilmente hackerabili, che posso utilizzare sulle mie applicazioni in caso, come salvagente, in caso ho un problema, rimangono attive sul progetto. Magari, cosa ne so, si possono copiare quello che c'è su Cloudflare e quello che c'è su Firebase, si portano sui miei programmi e si attivano solo quando oltrepasso i limiti come salvagente di emergenza. Volevo sapere se si poteva fare delle cose del genere sui miei computer, girano su Windows. I miei computer sono abbastanza performanti, se non sono performanti. Volevo chiederti se potevo creare dei server del genere, magari li attacco sotto un UPS in caso manca la corrente e niente, internet o la fibra, quindi 2.5 gigabit. Quindi volevo chiederti questo consiglio qua, se puoi cercare approfonditamente delle soluzioni super moderne, smart e intelligenti.

## Cosa usa l'app oggi (letto dal codice il 10/11)
- Cloudflare, piano gratuito, account solo dell'app: sito in file statici + server `worker.js` su `pronti-in-tavola.pronti-in-tavola.workers.dev` (nessun dominio nostro); 2 memorie Durable Objects con SQLite (`Avvisi`, `Ricettario`); Workers AI; 2 cron (`wrangler.jsonc`).
- Firebase, piano gratuito: Firestore + accesso Google (`dati.js`), con la copia dei dati sul telefono.
- Blocco del 10/11 (PT E52-E54): finite le 5.000.000 di righe lette al giorno delle Durable Objects, per il motore del ricettario e non per le persone.
- Già in corso nella Principale, da NON rifare: C130 (meno letture, contatore), C135 (corsia d'emergenza degli avvisi nel KV), C136 (motore a mano), C137 (modalità risparmio).
- Già deciso da Mario: niente piani a pagamento, niente blocchi alle persone, solo avvisi a lui (`gia-deciso-da-mario.md`).

## Ricerca (letta il 10/11/2026; fra parentesi la data della pagina)
| Tema | Cosa dice | Fonte |
|---|---|---|
| Limiti gratis di Cloudflare | Workers 100.000 richieste al giorno; Durable Objects 100.000 richieste, 5 milioni di righe lette e 100.000 scritte al giorno; KV 100.000 letture e 1.000 scritture al giorno; azzeramento 00:00 UTC (01:00 italiane d'inverno); oltre il limite le operazioni di quel tipo falliscono; i file statici sono gratis e senza limite, ma gli indirizzi mandati prima al server (`/api/*`) oltre il limite rispondono 429 | developers.cloudflare.com: workers/platform/limits (29/10/2026), durable-objects/platform/pricing (18/10/2026), workers/static-assets/billing-and-limitations (03/11/2026) |
| Motore di Cloudflare in casa | `workerd` è open source, serve anche «per ospitare in proprio le app fatte per Workers»; provato su Linux, macOS e Windows x86-64; `workerd serve wrangler.jsonc` accetta solo `name`, `main`, `compatibility_*`, `vars`, `durable_objects`, `migrations` (niente `assets`, `ai`, `triggers`); è un motore, non una piattaforma (niente orari, niente pubblicazione) | github.com/cloudflare/workerd (README, 10/11/2026) |
| Piattaforme nuove del 2026 | `denoland/celld` (Workers, Durable Objects SQLite, cron e file statici dal `wrangler.json`; Linux; giovane), `elliothux/open-compute` (un solo programma, Linux e macOS, nato 08/2026), `solcreek/groundflare` (v0.5), OpenWorkers (beta, senza SQL nelle Durable Objects) | GitHub dei progetti (10/11/2026) |
| Tunnel (uscire da casa senza aprire porte) | Cloudflare Tunnel: gratis, ma un indirizzo fisso vuole un dominio su Cloudflare. Tailscale Funnel: gratis, nome fisso `…ts.net`, però piano gratuito «solo uso non commerciale», ancora beta, banda limitata non dichiarata. ngrok gratis: 1 GB e 20.000 richieste al mese | confronti di ottobre-novembre 2026 (layerv.ai 01/10, zyvop.com 26/10, techloghub.com 05/11), tailscale.com/pricing |
| Dominio | `.com` a prezzo di costo su Cloudflare: 11,17 $ l'anno dal 01/11/2026; `.it` da circa 8,99 € + IVA l'anno | pricing.registrar.cloudflare.com/price-changes; ildominio.it/listino-domini (10/11/2026) |
| Firebase in casa | Non esiste. Google: gli emulatori non vanno usati come Firebase in proprio, «non sono adatti alla produzione» | firebase.google.com/docs/emulator-suite (09/11/2026) |
| Limiti gratis di Firestore | 50.000 letture, 20.000 scritture, 20.000 cancellazioni al giorno, 1 GiB; azzeramento verso mezzanotte del Pacifico (~09:00 italiane); oltre: errore RESOURCE_EXHAUSTED fino all'azzeramento; backup ed export gestiti solo col piano a pagamento | firebase.google.com/docs/firestore/quotas (05/11/2026), …/manage-data/export-import (05/11/2026) |
| Alternative a Firebase | PocketBase (un file solo, v0.41.1 del 28/10/2026, ancora prima della 1.0), Supabase (Docker, minimo 4 GB di RAM), Appwrite, Convex: per tutte va riscritto `dati.js`, e la copia sul telefono che funziona senza rete va rifatta a mano | ssdnodes.com/learn/self-hosted-firebase-alternatives (02/11/2026), opensourceswap.com (02/11/2026) |
| Motore di GitHub in casa | Oggi gratis, zero minuti. La tariffa di 0,002 $ al minuto annunciata il 16/12/2025 per il 01/03/2026 è stata rinviata il 17/12/2025, senza data nuova (rinviata, non cancellata). Solo repository privati; bastano connessioni in uscita sulla porta 443; le azioni Docker vogliono Linux | docs.github.com (self-hosted runners), github.blog/changelog 16/12/2025, lizard.build (04/11/2026) |

## Strade
### 1 · Officina (consiglio: si parte da qui)
Il PC fa solo chiamate in uscita, nessuna porta aperta. Lavori:
1. Motore del ricettario in casa (`gz.mjs`, `rf.mjs`): legge i siti, prepara le ricette, fa i conti pesanti in un SQLite suo; a Cloudflare manda solo ricette finite, a pezzi piccoli e misurati. Variante: archivio delle ricette in file statici del sito (gratis e senza limite), aggiornato la notte.
2. Sentinella fuori da Cloudflare: consumi di Cloudflare (chiave di sola lettura di C130) e di Firebase, e salute del sito; avviso a Mario al 50% e all'80%.
3. Copia viva dei dati di Firestore (ascolto in tempo reale, 1 lettura per documento cambiato).
4. Prove dell'app col motore di GitHub di casa; lo stesso motore fa da orologio dei lavori 1-3 (si vedono dal telefono).
- 👍 0 €, nessuna porta, toglie la causa del blocco del 10/11. PC spento: si fermano solo i lavori dietro le quinte.
- 👎 Se Cloudflare si blocca per altro, da sola non tiene accesa l'app.

### 2 · Gemello silenzioso (strada 1 + riserva senza porte)
- Avvisi: il PC guarda gli ordini in Firestore; se dopo ~20 secondi l'ordine non ha il segno «avvisato», la notifica la manda lui (una notifica è una chiamata in uscita verso Google o Apple).
- Casella postale: il telefono lascia la domanda per l'aiutante in Firestore, il PC la legge, risponde (Groq o un'AI in casa) e lascia lì la risposta.
- 👍 Copre gli avvisi fermi anche a Cloudflare tutto bloccato; sempre 0 € e nessuna porta.
- 👎 Più codice e più prove; chiave degli avvisi anche sul PC; non copre un blocco di Firebase; in parte doppione di C135.

### 3 · Server gemello pubblico
- `worker.js` in casa con `workerd` (o `celld`) dentro una macchina virtuale Linux (WSL2 o Hyper-V), fuori con un tunnel; l'app passa al secondo indirizzo quando il primo risponde «limite finito».
- 👍 Copia vera del server: tutto continua.
- 👎 Porta pubblica verso casa, da tenere aggiornata; due memorie da tenere uguali; dominio (~10 € l'anno) o Tailscale gratis coi suoi termini; riavvii di Windows.

### Scartata · tutto in casa (via Firebase)
Riscrivere `dati.js`, rifare la copia senza rete, e casa diventa il punto unico che ferma l'app.

## Occhio critico
- Doppioni: la strada 2 e C135 coprono lo stesso guaio da due lati → prima i numeri della sentinella, poi si decide.
- Doppi avvisi: segno «avvisato» sull'ordine + stesso `tag` della notifica.
- Limiti: ogni lavoro del PC che legge Firestore o scrive su Cloudflare si misura PRIMA (PT E52); un ascolto staccato da più di 30 minuti rilegge tutto.
- Chiavi sul PC: utente robot di Firebase con regole sue (mai la chiave che può tutto), mai nel repo.
- Senza Claude: accendere, spegnere e vedere i lavori dal telefono.
- Sicurezza: utente Windows a parte senza poteri di amministratore (meglio un PC solo per questo), aggiornamenti automatici, UPS con spegnimento ordinato e riaccensione da sola.
- Tailscale gratis è «solo uso non commerciale»: per un'app che vende è un rischio sui termini (detto una volta).

## Domanda fatta a Mario (Salvagente 1, 10/11 ~18:45) · 🛑, aspetta la risposta
Di cosa parliamo: usare il suo PC di casa come aiuto per l'app di Monica, per non restare fermi quando finiscono i limiti gratis; nell'app l'aspetto non cambia, cambia chi fa i lavori dietro.
1 · Officina: il PC fa i lavori pesanti, avvisa dei consumi e tiene la copia dei dati. Per Monica e i clienti non cambia niente.
2 · Officina più gemello silenzioso: in più, a Cloudflare fermo, Monica riceve lo stesso gli avvisi degli ordini.
3 · Anche il server gemello: a Cloudflare fermo l'app continua intera; serve un dominio (circa 11 € l'anno) o il tunnel gratis coi suoi limiti.
4 · Niente per ora: resta la corsia d'emergenza della Principale.
Consiglio dato: 1; dopo due settimane di numeri della sentinella si decide la 2; la 3 solo come progetto da appassionato.
Detto anche: sul motore di GitHub in casa (gratis oggi, solo repository privati, meglio in WSL2, fa anche da orologio dei lavori); 5 regole per il PC (niente porte sul router, utente a parte senza poteri di amministratore, chiavi coi permessi minimi, aggiornamenti automatici, UPS con spegnimento ordinato e riaccensione dal BIOS).

## Parole di Mario (10/11 18:51, intere; scritte nella Salvagente 1 dopo il passaggio, girate alla 2)
> Più che altro ho paura di che mi si stacca la luce, cioè la stabilità che ti dà un server non te la dà nessuno. Io il mio PC lo utilizzerei solo come alternativa o supporto. Confrontami un po' con degli schemi, la scelta 1 e la scelta 2, perché io ero intenzionato un po' la scelta 2, ma tu mi consigli la 1, quindi magari qualcosa non l'ho capito.

Lettura (Salvagente 1): non è ancora la scelta. Vuole il confronto fra la 1 e la 2 con gli schemi; propende per la 2; il PC solo come alternativa o supporto, per paura che salti la luce. Punti per la risposta: in 1 e in 2 il server vero resta Cloudflare (luce saltata = si ferma solo l'aiuto, l'app va); la 2 contiene la 1; il consiglio «1 adesso» riguardava solo l'ordine dei lavori (prima i numeri della sentinella; la 2 è in parte doppione della corsia d'emergenza C135). Se conferma la 2: in due tempi, prima l'officina e poi il gemello.

## Risposta al messaggio delle 18:51 (Salvagente 2, 10/11 19:02) · mandata, NON rimandarla
- Schemi, uno per scelta, misura da telefono: `archivio/foto/2026-11-10-1900-c138-scelta-1-officina.png`, `archivio/foto/2026-11-10-1900-c138-scelta-2-gemello.png`; sorgente `docs/lavori-in-corso/c138-schemi.html` (come rifarli: commento in testa). A ogni promemoria della domanda si rimandano (E247).
- Detto a Mario: non ha capito male, la 2 è la 1 più il gemello; in tutte e due i server veri restano Cloudflare e Firebase; il PC è supporto (1) o supporto più alternativa (2); se salta la luce l'app va come oggi; il consiglio «1» riguardava solo l'ordine dei lavori.
- Tabella «cosa succede se»: luce saltata (uguali) · limiti finiti come il 10/11 (uguali: avvisi dalla corsia d'emergenza C135 quando sarà online; la 2 ha in più la riserva del PC) · Cloudflare tutto fermo (1: ordine salvo ma niente avviso a Monica; 2: avviso dal PC) · Cloudflare fermo e luce saltata insieme (avviso fermo in tutte e due) · 0 € e nessuna porta aperta in tutte e due · la 2 vuole più lavoro (codice, prove, una chiave in più sul PC) e non copre un blocco di Firebase.
- Consiglio nuovo, dopo il suo messaggio: **2 in due tempi** (prima l'officina, identica alla 1; poi il gemello, dopo aver guardato cosa copre già C135; prima del secondo tempo gli mostro i numeri e può fermarsi alla 1).
- Consiglio pratico detto: sotto l'UPS anche il router e la scatola della fibra.
- Controllato alle 18:59 (lettura del sito vero): online c'è la v0.10.17. Dalle consegne della Principale 54 (~19:10): la v0.10.18 è nel ramo ma il deploy è fallito (PT E57); C135 è nel codice ma **spenta** finché Mario collega il cassetto KV. A Mario detto così: «corsia d'emergenza nel codice ma ancora spenta, manca un passo a mano suo, lo segue la chat principale».
