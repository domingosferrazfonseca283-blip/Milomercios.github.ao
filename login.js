import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

document.getElementById('btn-login').addEventListener('click', async () => {
  const email = document.getElementById('log-email').value.trim();
  const senha = document.getElementById('log-senha').value;
  if (!email || !senha) return alert('Por favor, preencha todos os campos.');
  try {
    const cred = await signInWithEmailAndPassword(auth, email, senha);
    const perfilSnap = await getDoc(doc(db, 'usuarios', cred.user.uid));
    const perfil = perfilSnap.exists() ? perfilSnap.data() : {};
    if (perfil.tipo === 'admin') window.location.href = 'admin.html';
    else if (perfil.tipo === 'vendedor') window.location.href = 'vendedor.html';
    else window.location.href = 'index.html';
  } catch (error) {
    console.error(error);
    alert(error.code === 'auth/invalid-credential' ? 'E-mail ou senha incorretos.' : 'Erro ao entrar: ' + error.message);
  }
});
