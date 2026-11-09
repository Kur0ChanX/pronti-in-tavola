# Ultima risposta di Claude (09/11/2026 18:27 ora italiana)

Ho capito: su iPad, dall'app installata sulla Home, il microfono dei clienti suona ma non capisce; su Android va. Il video è in `archivio/foto/`.

✅ FATTO
- Causa trovata nelle fonti (WebKit, bug 225298 del 2021 ancora aperto a 11/2026): nell'app installata sulla Home di iPhone e iPad il **riconoscitore** di Safari (la dettatura del telefono) esiste ma non parte mai; dopo un audio resta muto anche in Safari (bug 321436, 08/2026).
- Correzione v0.9.81: su iPhone e iPad il microfono passa subito all'**ascolto preciso** (registra e capisce il server, serve internet); il «sì» dopo la proposta si …
