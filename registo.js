import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

document.getElementById('btn-registar').addEventListener('click', async () => {
  const nome = document.getElementById('reg-nome').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const senha = document.getElementById('reg-senha').value;
  if (!nome || !email || senha.length < 6) return alert('Preencha todos os campos. A senha deve ter pelo menos 6 caracteres.');
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    await setDoc(doc(db, 'usuarios', cred.user.uid), {
      nomeLoja: nome,
      email,
      tipo: 'vendedor',
      planoSubscricao: 'mensal',
      subscricaoAtiva: true,
      criadoEm: serverTimestamp()
    });
    alert('Conta de vendedor criada com sucesso!');
    window.location.href = 'vendedor.html';
  } catch (error) {
    console.error(error);
    alert('Erro ao criar conta: ' + error.message);
  }
});
