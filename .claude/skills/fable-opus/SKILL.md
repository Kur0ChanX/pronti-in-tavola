---
name: fable-opus
description: Regola «Fable pensa, Opus esegue»: Fable salva il piano a pezzi, Opus lo esegue dal primo passo aperto. Usala quando la chat lavora con Fable su un lavoro grande o passa da Fable a Opus.
---

# Fable pensa, Opus esegue

Perché: Fable ragiona meglio ma costa di più e Mario lo dà a tempo; Opus esegue bene un piano chiaro. Mario deve poter passare a Opus in qualunque momento senza perdere niente: il piano su GitHub è il ponte fra i due.

## Quando scatta
- La chat lavora con Fable (lo dice l'hook del motore) all'inizio di un lavoro grande o vago, o Mario scrive «pensa con Fable» / «ultracode».
- Domanda, lettura o lavoro piccolo con Fable: rispondo e basta, niente piano (e la riga «⬇️ basta Opus», skill `nuova-funzione` «Motore giusto»).
- Un lavoro, un solo pensatore: il tempo 1 lo fa UNA chat. Prima di pensare guardo `docs/CHI-FA-COSA.md`; un'altra chat con lo stesso lavoro legge il piano e non rianalizza (E311).

## Tempo 1 · Fable pensa (niente codice dell'app)
1. Ora di fine dal tempo che dà Mario (ora italiana, `TZ=Europe/Rome date`); senza tempo detto: circa 1 ora.
2. **Prima lo scheletro** (entro ~15 minuti): le sezioni del piano, le scelte da prendere, i primi passi già eseguibili. Commit e push. Se Mario ferma qui, Opus ha già da fare.
3. **Poi in profondità, per difficoltà**: prima le parti dove Opus sbaglierebbe (architettura, dati veri, soldi, sicurezza e regole di accesso, difetti difficili, rischi, scelte con pro e contro); i passi meccanici (rinomine, testi, prove di routine, foto) in una riga, li dettaglia Opus.
4. Letture, `grep`, prove e comandi in sola lettura per verificare le ipotesi: sì. Codice dell'app: no.
5. **Aiutanti** (eccezione alla regola «Aiutanti col motore leggero», SOLO nel tempo 1): agente `pensatore` (progetto senza: `Agent` tipo `Plan` con `model: fable`, e il rapporto lo salvo io subito), UNO per argomento indipendente, al massimo 6 per turno con Fable (tetto dell'hook `spreco-token.py`, Mario 09/11 «come consiglio»; altri argomenti nel turno dopo). Ognuno scrive SUBITO il suo rapporto in `archivio/<C>/rapporti/NN-<tema>.md` e mi risponde in 3 righe.
6. **Salvo a ogni sezione finita** (commit e push, non alla fine) e aggiorno «Stato» in testa al piano. Turni brevi (≤ 20 minuti): Mario può fermarmi quando vuole.
7. **Prova del passaggio**, prima di dire «piano pronto»: rileggo il piano come Opus senza memoria della chat. Ogni passo si fa col solo file? Se no, lo completo.
8. A Mario una riga: «Piano pronto (N passi): da qui basta Opus, lo cambi tu dal menu del motore». Se Mario non cambia, eseguo io il piano: mai aspettare.

## Il piano (in `docs/lavori-in-corso/<C>.md`, «un posto solo»)
```
## Piano (Fable, gg/mm hh:mm) · Stato: §1 ✅ §2 ✅ §3 in corso · Primo passo aperto: A3
### Parole di Mario (intere)
### Già deciso (una riga di perché ciascuna): Opus non le riapre
### Non toccare (file e lavori delle altre chat)
### Dritte per Opus (trappole, parti fragili, come provare)
### Passi (in ordine; uno = un commit piccolo)
- [ ] A1 · cosa · `file:riga` · cambio esatto (il codice dove serve) · prova: `comando` · fatto quando: … · rischio: …
### ❓ Per Fable (punti che Opus non ha saputo decidere, con la prova)
### Domande per Mario (scelte numerate col consiglio)
### Strade scartate (perché)
```

## Tempo 2 · Opus esegue
1. Al cambio (stessa chat o sessione nuova), prima riga a Mario: «🧠 Opus · <impegno> · riparto dal passo N» (N = «Primo passo aperto»). Leggo solo il piano (testa, «Già deciso», «Dritte», il passo aperto): non i rapporti interi, non la chat vecchia.
2. Passo per passo: cambio, prova, commit e push; nello stesso commit «- [x]» nel passo e «Primo passo aperto» avanti.
3. Non rifaccio l'analisi e non riapro «Già deciso». Passo poco chiaro o sbagliato (una prova lo smentisce): non ci ripenso a lungo, lo scrivo in «❓ Per Fable» con la prova e vado al passo dopo.
4. «❓ Per Fable» che blocca i passi dopo, in un lavoro grande o rischioso: aiutante `consulente-fable` (al massimo 2 volte per lavoro). Gli altri: a fine piano, a Mario una riga «N punti aspettano Fable: rimettilo ~10 minuti quando vuoi».
5. Scelta che tocca chi usa l'app, gusti o soldi: domanda a Mario (skill `domande`), il resto va avanti.
6. Prove, foto, PR e consegne come sempre.

## Cambio di motore
- Lo fa solo Mario (menu del motore o `/model`); io non lo chiedo; `create_session` col motore e l'impegno della sessione che chiude (C474, Mario 10/11 13:19; col lavoro di Fable a metà anche il segno C472, sotto).
- Stessa chat: Opus rilegge la chat una volta senza memoria veloce (costa, ma va bene). Vicino alla soglia meglio l'handoff: la sessione nuova legge solo il piano.
- Soglia nel tempo 1: handoff come sempre (skill `consegne`); il piano è già il posto unico, le consegne lo nominano col «Primo passo aperto». La sessione nuova nasce già con Fable (`create_session` con `model` Fable, C472, Mario 10/11 12:10 «1»); se nasce con un altro motore resta ferma finché Mario non mette Fable o scrive «vai con Opus» (segno «⛔ FABLE», hook `fermo-fable.py`).
- Fable di nuovo a metà lavoro: tempo 1 corto, solo sui «❓ Per Fable»: risposte nel piano, poi si riprende.

## Titoli
Tempo 1 «… · piano con Fable»; tempo 2 «… · esegue il piano» (regola «Titoli»: 3 parole).
