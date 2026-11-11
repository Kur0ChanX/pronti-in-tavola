# Ultima risposta di Claude (11/11/2026 17:48 ora italiana)

Ho capito: vuoi un riquadro dove incollare la chiave.

Purtroppo non posso aprirtelo. Il modulo sicuro rifiuta le chiavi Google, e l'ho appena provato dal PC. Se ti apro un modulo di altro tipo, la chiave non funziona.

L'unico posto giusto per incollarla sono le impostazioni dell'ambiente. Ci vuole un minuto:

1. Sopra la chat, tocca il nome dell'ambiente (accanto al titolo della sessione) → «Modifica».
2. Sezione «Network secrets» → aggiungi una voce.
3. Host `www.googleapis.com` · Header `X-Goog-Api-Key` · Prefisso vuoto · Valore: incolla la chiave.
4. Salva.

Non incollarla qui in chat. …
