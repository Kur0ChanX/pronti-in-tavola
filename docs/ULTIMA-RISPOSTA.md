# Ultima risposta di Claude (09/11/2026 17:09 ora italiana)

Tutto salvato su GitHub. Ecco le regole da incollare (passo 1 del messaggio prima): tocca **Copia** sul riquadro, poi nella pagina di Firebase cancella tutto il testo vecchio e incolla, poi **Pubblica**.

```
rules_version = '2';
// Regole di sicurezza di Pronti in Tavola (docs/SPEC-FIREBASE.md, passaparola).
// Entrato = telefono che ha aperto il link (accesso anonimo).
// Utente = documento utenti/<uid> di quel telefono (nome, stato, cliente).
// Approvato = telefono legato da Monica a un cliente. Gestore = Monica o Mario (gestori/<uid>).
// Prove: npm run prova-regole (emulatore, …
