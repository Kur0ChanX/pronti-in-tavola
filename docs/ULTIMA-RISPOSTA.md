# Ultima risposta di Claude (09/11/2026 21:38 ora italiana)

Ho capito: riparto dalle consegne della #36. Il primo lavoro era C111, cioè la schermata dev che non si apre sull'iPad.

───
✅ FATTO
- **v0.9.91 online.** Prova: la pubblicazione del sito è riuscita e il sito vero risponde con la 0.9.91. Prove automatiche: 79 OK, 0 NO.
- **Probabile causa (C111):** su iPad i 7 tocchi veloci sulla firma «Powered by» venivano presi come «doppio tocco = ingrandisci». Così non contavano. È un'ipotesi: qui non ho un iPad vero per provarla. Ho corretto la firma con **touch-action** (regola di stile che dice al telefono cosa fare coi tocchi: qui «niente zoom col …
