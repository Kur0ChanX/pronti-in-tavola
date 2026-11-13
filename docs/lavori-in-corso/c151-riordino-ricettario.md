# C151 · Riordino della pagina Ricettario (Mario 13/11 12:50)

## Parole di Mario (intere)
13/11 12:50, con 4 foto (Ricettario → Proteiche, cerca «cloud bread», Ordina «Nuove» acceso, 0 ricette):
> riordina la pagina oltre a non trovare nulla c'è un casino in questa pagina 3000 tastine filtri ok servono ma non si capisce nulla

## Cause trovate (#74)
- **0 risultati**: la ricerca guarda solo la scheda accesa (Proteiche). «Cloud bread» è fra le Ricette video e non è «proteica» (`proteica` assente in `ricette-video.js`); le ricette video entrano nell'elenco solo se preferite (`videoPref` in `vRicettario`). In più «Ordina: Nuove» acceso conta come filtro.
- **Confusione**: in Proteiche, prima delle ricette, ci sono ~40 tasti: 4 schede, «Ricette video», Quando (8), Fonte proteica (10+), Da chi (10+), «⚙️ Portata…» con altre 4 righe (19 tasti), riquadro del server (barra, «Cerca», «Le regole»).

## Proposta (scelta mia, Mario la vede in foto prima di andare online)
1. In alto solo la ricerca: cerca in TUTTO (proteiche, ricette video, ricettario, mie); se la scheda accesa non ha niente, mostra dove l'ha trovata.
2. Schede: Tutte · 🏋️ Proteiche · 🎬 Video · ⭐ Preferite · Altre ▾ (il tastone «Ricette video» diventa una scheda).
3. Una riga: «🎛️ Filtri (N)» + «Ordina: … ▾». Filtri apre un pannello con tutti i gruppi e «Mostra N ricette» per chiuderlo.
4. Filtri accesi come etichette con ✕ e «Azzera».
5. Subito le ricette. Riquadro del server («Da leggere…», «Cerca altre») in fondo, chiuso.

## Stato
- 13/11 #74: proposta scritta, al lavoro sulla patch (mai commit dei `.js`, PT E69).

## Video che non sono ricette (Mario 13/11 12:53-12:54)
- 12:53 «è uno scherzo verooooooo????» (foto «GAG PARTE 4 | Gambe»: ingredienti Manubri, Elastici, Tappetino).
- 12:54 «magari cose utili cosí lasciale visto che c'è ma una sezione a parte» (foto «Ti alleni tanto ma non dimagrisci»: argomenti al posto degli ingredienti).
- Scelta: NON si tolgono. Sezione a parte «💡 Consigli e allenamenti» nelle Ricette video: fuori da ricette, ricerca di cibo, Proteiche, spesa e menù; nella pagina «Di cosa parla» al posto di «Ingredienti».
- Elenco: candidati trovati in automatico (righe senza dosi né cibo), poi letti a occhio uno per uno (PT E25) → `tools/dati/video-non-ricette.json`. Primo giro: ~28 candidati, fra cui vitamina C, integrazione runner, sale nascosto, budini «pr-ou» (gusti di un prodotto), pasticcerie (Iginio Massari…).
- La rimozione del solo «GAG» (v0.10.27 preparata alle 12:58) NON va online: superata da questa scelta.
- Si pubblica insieme al riordino, dopo le foto.
- 13/11 ~13:15 Mario: «va bene metti online ma caricarle io 30 per volta non consumo limiti?» → «1»: v0.10.27 in pubblicazione (#74).
