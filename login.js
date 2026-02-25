import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// COLOQUE AS SUAS CHAVES DO FIREBASE AQUI
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "seu-id",
    appId: "seu-app-id"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('log-email').value;
    const senha = document.getElementById('log-senha').value;

    if (!email || !senha) return alert("Por favor, preencha todos os campos.");

    try {
        await signInWithEmailAndPassword(auth, email, senha);
        alert("Login realizado com sucesso!");
        window.location.href = "admin.html"; // Redireciona para o painel de postagem
    } catch (error) {
        console.error(error);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            alert("E-mail ou senha incorretos.");
        } else {
            alert("Erro ao entrar: " + error.message);
        }
    }
});
