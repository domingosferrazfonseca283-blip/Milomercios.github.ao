import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const ADMIN_EMAIL = "domingosferrazfonseca283@gmail.com";

document.getElementById('btn-login').addEventListener('click', async () => {
  const email = document.getElementById('log-email').value.trim();
  const senha = document.getElementById('log-senha').value;
  if (!email || !senha) return alert('Por favor, preencha todos os campos.');
  try {
    const cred = await signInWithEmailAndPassword(auth, email, senha);
    const perfilRef = doc(db, 'usuarios', cred.user.uid);
    const perfilSnap = await getDoc(perfilRef);
    let perfil = perfilSnap.exists() ? perfilSnap.data() : {};

    if ((cred.user.email || '').toLowerCase() === ADMIN_EMAIL) {
      if (!cred.user.emailVerified) {
        return alert('Para proteger o painel, confirme primeiro o seu e-mail de administrador e volte a entrar.');
      }
      if (perfil.tipo !== 'admin' || perfil.email !== ADMIN_EMAIL) {
        await setDoc(perfilRef, {
          email: ADMIN_EMAIL,
          tipo: 'admin',
          nome: 'Administrador Milomércios',
          estadoConta: 'ativo',
          subscricaoAtiva: false,
          atualizadoEm: serverTimestamp()
        }, { merge: true });
        perfil = { ...perfil, tipo: 'admin', email: ADMIN_EMAIL };
      }
    }

    if (perfil.tipo === 'admin' && (cred.user.email || '').toLowerCase() === ADMIN_EMAIL) window.location.href = 'admin.html';
    else if (perfil.tipo === 'vendedor') window.location.href = 'vendedor.html';
    else window.location.href = 'index.html';
  } catch (error) {
    console.error(error);
    alert(error.code === 'auth/invalid-credential' ? 'E-mail ou senha incorretos.' : 'Erro ao entrar: ' + error.message);
  }
});
