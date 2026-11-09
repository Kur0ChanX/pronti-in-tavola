# Consegne della chat parallela «Voce» (comando vocale dei CLIENTI, C105) · Voce 1 → Voce 2

**Già deciso da Mario (non richiedere):** aiutante dei clienti ACCESO per tutti (08/11); l'AI propone, il cliente conferma e l'ordine lo manda lui; voce femminile non robotica; Microsoft lasciata perdere; allergie solo sul telefono; niente artefatto, Mario prova sul sito vero; ogni funzione nuova anche nell'aiutante di Monica (`.claude/rules/progetto.md`); ogni «👉 DA FARE TU» con «A cosa serve» (PT E36).
**Da non rifare:** lo studio è fatto: TUTTO in `docs/SPEC-VOCE-CLIENTI.md` (mappa del codice con righe, ricerca del 09/11, strada scelta, cosa non fare, prove). Non rileggere aiutante.js/worker.js per intero: usa le righe della specifica e `grep -n`.
**Cosa preme a Mario adesso:** un comando vocale dei clienti «veramente performante», smart e sorprendente. Lo vuole vedere nell'app vera.

Voce 1 = `session_01WTjqUuVyq5p6FhV1dVJtVC`, aperta a mano da Mario 09/11 17:00, chiusa alla soglia 09/11 ~17:20 (250k token spesi solo in letture e ricerca: colpa degli strumenti con uscite enormi, `list_triggers` e la ricerca web; lezione: `list_triggers` con `limit` 3 e ricerche web una alla volta con obiettivo stretto). Catena 1 di 8. Voce 2 = `session_01WTjqUx7JeVdDBrvgVgjfXx` (aperta da Voce 1 con create_session, catena 2 di 8). Impegno: `.claude/settings.json` com'è (condiviso); Mario ha scelto «Extra» nel selettore per questa catena.

## Stato (controlla, non fidarti)
- Ramo `claude/pronti-ramo-definitivo` = origin (b655445b + queste consegne). Online v0.9.78 (la principale, «🟢 🍝 Principale 34», `session_01WTjqUxkfi1LrUJwmzh137d`, lavora su installazione e notifiche e può pubblicare altre versioni: prima del tuo push `git fetch` + merge e versione libera).
- Nessun codice scritto ancora. Zona e file nostri in `docs/CHI-FA-COSA.md` (riga «Voce»): `voce-clienti.js` NUOVO, `aiutante.js` solo zona clienti, `worker.js` solo `/api/ascolta`, `index.html` (script), `tools/anteprima.py` (lista file, riga 18), `style.css` solo `.vc-*`, `tools/prova.js` passi nuovi in fondo, `opzioni.js` voci `voceClienti*`.
- Sveglie: nessuna di questa catena.

## Prossimi passi (occhio critico prima di ognuno, C333)
1. Avvio: titolo «🟩 🍝 Voce 2 · voce dei clienti», id tuo in `docs/CHI-FA-COSA.md` («## Catene», riga Voce), fetch e merge. Prima riga a Mario: cosa farai in 3 righe, poi codice (niente nuove domande: le scelte sono nella specifica §3; a Mario solo ciò che cambia per i clienti).
2. Strato B (`capisciCliente`) in `voce-clienti.js` + prova 1 della specifica (`SOLO=capisci node tools/prova.js` dopo `python3 -I tools/anteprima.py`): è la base di tutto e funziona senza rete.
3. Strato A (`ascoltaCliente` telefono + «Ho capito» + alternative) e aggancio in `aiutante.js` (`inviaAC`, `ac-detta`), `.vc-fab`; prova 2.
4. Strato D (`/api/ascolta` Whisper + Groq) e riserva nel telefono (MediaRecorder); prova 3-4. Controlla il nome del binding `env.AI` e dove si contano le domande (`contaAIC`, `contoAI`) per aggiungere `ascolto`.
5. Strato C (sì/no a voce, «Dettami l'ordine», esempi sul menù di oggi); prova 5. Impostazioni E in `opzioni.js` + «Solo per te, Mario».
6. Giro completo, versione libera + NOVITA (1 riga per funzione), `docs/DA-FARE.md` C105 aggiornata (👁 già scritta), push → `sito.yml` success → a Mario «chiudi e riapri l'app» e dove toccare (PT E22), con «A cosa serve».
7. Alla soglia: consegne qui (mai in PASSAGGIO-CONSEGNE), Voce 3 solo se resta più di mezza sessione.

## Domande aperte a Mario (non bloccanti: vai col consiglio e diglielo)
- «Sì» detto a voce mette nel carrello (consiglio 1) oppure serve sempre il tocco su Conferma (2)?
- Microfono grande fisso in basso nel menù (consiglio 1) oppure solo quello nel riquadro dell'aiutante (2)?

## Ultimo messaggio di Mario (parola per parola, 09/11 ~17:00)
«aggiungi una sessione parallela per un team tavola che mi potenzi molto il comando vocale per i clienti. Abbiamo potenziato quello di Monica, quello dei clienti lo voglio veramente performante a livello di lettura della voce, di quello che riesci a fare. Lo voglio ampliare molto come potenza, insomma, valuta tutto quello che si può fare per un comando vocale per il cliente. Mi sembra che chiedi a Monica, inventati cose intelligenti, smart, insomma, fai tutto quello che è in tuo potere di veramente utile al cliente, è sorprendente, ecco, innovativo.»
(«Mi sembra che chiedi a Monica» letto come: l'aiutante dei clienti oggi rimanda troppo spesso a Monica (`datiAIC`: «da chiedere a Monica»): rispondere quando i dati ci sono, rimandare a Monica solo per salute e cose non scritte.)

## Numeri
C105 preso da questa catena (prossimo libero C106: detto alla principale con send_message). Versione: la prima libera al momento del push.

## Per riaprire la catena a mano (se serve)
Mario apre una sessione sul repo `Kur0ChanX/pronti-in-tavola`, ramo `claude/pronti-ramo-definitivo`, e incolla: «[AVVIO] Sei la chat parallela «Voce N» (comando vocale dei clienti) di Pronti in Tavola, ramo claude/pronti-ramo-definitivo. Leggi CLAUDE.md, docs/ERRORI.md e docs/CONSEGNE-PARALLELA-voce.md, poi continua dai «Prossimi passi».»
