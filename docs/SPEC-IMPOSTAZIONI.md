# Impostazioni modificabili da Monica (C88)

Richiesta di Mario (08/11 ~18:40): «aggiungi tantissime impostazioni da modificare, così non siamo vincolati al codice con Claude e siamo pronti se lo chiede Monica… col comando vocale la porta proprio dove ha richiesto».

## Come è fatto
- Un elenco unico in `opzioni.js` (`OPZIONI`): chiave, gruppo, nome, tipo, valore di base, limiti, spiegazione, parole per l'aiutante.
- Il valore di base = come funziona oggi: niente cambia per i clienti finché Monica non tocca.
- Si salvano in `S.impostazioni.<chiave>` (documento `impostazioni/app`, un campo per chiave: due persone insieme non si pestano i piedi).
- Si vedono in Impostazioni, sotto «Altre regole dell'app», a voci (una aperta alla volta, come C39). In cima: «🔎 Cerca un'impostazione».
- Aiutante: ogni voce ha «Portami lì» (anche senza rete) e l'AI può cambiarla con l'azione `impostazione` (Monica conferma).
- Tipi: testo, messaggio (con parole che l'app riempie: {nome} {n} {giorno} {totale} {indirizzo} {mappa} {nota} {orari} {link}), numero, euro, ora, sì/no, giorni della settimana.

## Lotto 1 (v0.9.57)
| Voce | Cosa fa | Di base |
|---|---|---|
| Avviso in cima al menù | frase che i clienti vedono subito | vuoto |
| Giorni in cui non si ritira | giorni fissi di chiusura | nessuno |
| Ora limite per ordinare | dopo quell'ora il primo giorno slitta di uno | nessuna |
| Quanti giorni avanti si ordina | giorni mostrati nella scelta del ritiro | 14 |
| Ordine minimo | sotto la cifra l'ordine non parte | 0 |
| Orari di ritiro | si leggono nel carrello e nel messaggio {orari} | vuoto |
| Nota dei clienti | il cliente può scrivere una nota | sì |
| Quanto dura «Novità» | giorni dell'etichetta | 14 |
| Aiutante per i clienti | acceso o spento | sì |
| Messaggi WhatsApp: confermato, pronto, altro giorno | testo con le parole da riempire | i testi di oggi |
| Firma dei messaggi | in fondo ai messaggi | «<nome> · Pronti in Tavola» |
| Tempo per «Annulla» | secondi del tasto Annulla | 10 |

## Lotto 2 (v0.9.60, C92)
| Voce | Cosa fa | Di base |
|---|---|---|
| Parti del menù | nomi, ordine, parti nuove (es. «Secondi»); con piatti non si toglie; a voce «aggiungi la parte secondi» anche senza rete | Stuzzichini, Primi, Dolci |
| Saluto in cima al menù | per chi non ha scritto il nome | «Benvenuti da <nome>!» |
| Frase della pausa | sotto «è in pausa fino a…» | «Puoi già ordinare per i giorni dopo.» |
| Altri modi di pagare | riga nel carrello (es. Satispay) | vuoto |
| Messaggio d'invito per gli amici | con {link}; senza, il link va in fondo | il testo di oggi |
| Biglietto: titolo e sottotitolo | il biglietto per gli amici | i testi di oggi |

Come funziona: `CATEGORIE` (data.js) segue `S.impostazioni.parti` (`applicaParti` in render); una parte tolta che ha ancora piatti torna in fondo, così nessun piatto sparisce.

## Non fatti (perché)
- Porzioni delle teglie e nomi dei formati: si cambiano già piatto per piatto (Prezzi); una regola unica cambierebbe gli ordini vecchi.
- Teglie al massimo in un giorno: serve un contatore sul server (il cliente non vede gli ordini degli altri): da proporre a Mario.
- Reparti della spesa: ogni ingrediente è legato al nome del reparto; rinominarli senza rompere la lista chiede un lavoro a parte.
