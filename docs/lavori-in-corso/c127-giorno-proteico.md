# C127 · pezzi 2-3: «📅 Il mio giorno proteico» e «🔁 Simili a questa» (Principale 48, 10/11/2026)

Scelta di Mario 10/11 ~15:05 «vai di consiglio 1 e 3». Foto della proposta: `archivio/foto/2026-11-10-1500-c127-proposta-giorno.png`.
Pezzo 1 (pagina ordinata) fatto nella v0.10.13.

## Pezzo 2 · Il mio giorno proteico (in «🏋️ Proteiche», sopra il riquadro verde)
- Obiettivo in grammi di proteine al giorno: Impostazioni → «Solo per te, Mario» (`fitGiorno`, base 150, da 50 a 300); «✏️» accanto lo porta lì.
- 4 proposte: 🌅 Colazione, 🍝 Pranzo, 🍎 Spuntino, 🍽 Cena, prese dalle proteiche di quel momento (`momentoRic`), mai la stessa due volte.
- Restano uguali per tutto il giorno (salvate sul telefono, chiave `pit-giorno-fit` con la data); il giorno dopo cambiano da sole.
- «🔄» su ogni riga cambia solo quella; un tocco sul nome apre la ricetta.
- Totale: proteine e kcal; se mancano grammi lo dice («mancano 33 g: aggiungi uno spuntino»).
- «🛒 Lista della spesa»: scarica le 4 ricette (restano anche senza rete), ingredienti per 1 porzione, uniti per nome, nella «La mia lista» della spesa; un «Annulla» toglie tutto; sale, pepe e acqua no.
- «📤 Manda»: testo pronto su WhatsApp (momenti, piatti, grammi, totale).
- «Nascondi» chiude il riquadro (ricordato sul telefono); «📅 Il mio giorno proteico» lo riapre.

## Occhio critico
- Nessuna proteica per un momento → la riga lo dice e propone «🔍 Cerca altre» per quel momento.
- Senza rete: proposte dalle ricette già sul telefono; la lista della spesa usa solo quelle già scaricate e dice quali mancano.
- Valori per porzione: la ricetta per 4 → ingredienti divisi per 4 (`qRic`).
- Due persone: è un piano personale sul telefono, niente sul server.
- Aiutante: voce «giorno proteico» che porta lì.

## Pezzo 3 · 🔁 Simili a questa
- In fondo a una ricetta proteica: fino a 4 proteiche con la stessa fonte proteica o lo stesso momento, prima quelle con più proteine per caloria; mai la ricetta stessa.
