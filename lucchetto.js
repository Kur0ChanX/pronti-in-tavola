/* Pronti in Tavola · lucchetto della parte di Monica (docs/SPEC-FIREBASE.md, «Accesso»).
   L'impronta o il PIN del telefono (WebAuthn, lo sblocco del telefono), senza server:
   la chiave resta sul telefono. La sicurezza vera sono Google e le regole del database;
   il lucchetto chiude la parte di Monica se il telefono resta in mano ad altri. */
'use strict';

const Lucchetto = (() => {
  const CHIAVE = 'pit-lucchetto-v1';   // { uid: { id, il } } o { uid: { senza: true } }
  const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const da64 = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const leggi = () => { try { return JSON.parse(localStorage.getItem(CHIAVE)) || {}; } catch (e) { return {}; } };
  const di = uid => (uid && leggi()[uid]) || null;
  function metti(uid, v) {
    const t = leggi();
    if (v) t[uid] = v; else delete t[uid];
    try { localStorage.setItem(CHIAVE, JSON.stringify(t)); } catch (e) { /* telefono pieno: si richiede la prossima volta */ }
  }

  /* c'è l'impronta o il PIN del telefono? (senza blocco schermo: no) */
  async function disponibile() {
    try { return !!window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); }
    catch (e) { return false; }
  }

  const rifiuto = () => Object.assign(new Error('non verificato'), { name: 'NotAllowedError' });
  /* la risposta è per questa pagina e questa sfida, e il telefono ha chiesto impronta o PIN (presenza + verifica) */
  function controlla(r, sfida, tipo, dati) {
    let cd;
    try { cd = JSON.parse(new TextDecoder().decode(r.clientDataJSON)); } catch (e) { return false; }
    if (cd.type !== tipo || cd.challenge !== b64(sfida) || cd.origin !== location.origin) return false;
    return !dati || (new Uint8Array(dati)[32] & 0x05) === 0x05;
  }

  /* la prima volta (o dopo «Entra di nuovo con Google»): il telefono crea la chiave */
  async function crea(uid, nome) {
    const sfida = crypto.getRandomValues(new Uint8Array(32));
    const c = await navigator.credentials.create({ publicKey: {
      challenge: sfida,
      rp: { name: 'Pronti in Tavola' },
      user: { id: new TextEncoder().encode(uid).slice(0, 64), name: nome || 'Monica', displayName: nome || 'Monica' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' },
      attestation: 'none', timeout: 60000
    } });
    const dati = c && c.response.getAuthenticatorData ? c.response.getAuthenticatorData() : null;
    if (!c || !controlla(c.response, sfida, 'webauthn.create', dati)) throw rifiuto();
    metti(uid, { id: b64(c.rawId), il: Date.now() });
  }

  /* a ogni apertura: impronta o PIN sulla chiave di questo telefono */
  async function apri(uid) {
    const k = di(uid);
    if (!k || !k.id) throw rifiuto();
    const sfida = crypto.getRandomValues(new Uint8Array(32));
    const c = await navigator.credentials.get({ publicKey: {
      challenge: sfida, allowCredentials: [{ type: 'public-key', id: da64(k.id) }], userVerification: 'required', timeout: 60000
    } });
    if (!c || b64(c.rawId) !== k.id || !controlla(c.response, sfida, 'webauthn.get', c.response.authenticatorData)) throw rifiuto();
    return true;
  }

  return { di, metti, disponibile, crea, apri };
})();
