import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// COLOQUE AS SUAS CHAVES AQUI
const firebaseConfig = {
    apiKey: "// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBwEcPZIAkJ8joGHjMqeNXMtf7bx3YxAvs",
  authDomain: "milomercios-12106.firebaseapp.com",
  projectId: "milomercios-12106",
  storageBucket: "milomercios-12106.firebasestorage.app",
  messagingSenderId: "293584624406",
  appId: "1:293584624406:web:96739386d21da307a8ce37",
  measurementId: "G-C49J85E493"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "seu-id",
    appId: "seu-app-id"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById('btn-registar').addEventListener('click', async () => {
    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const senha = document.getElementById('reg-senha').value;

    if (!nome || !email || !senha) return alert("Preencha todos os campos!");

    try {
        // 1. Cria o utilizador no Firebase Auth
        const credenciais = await createUserWithEmailAndPassword(auth, email, senha);
        const user = credenciais.user;

        // 2. Cria o perfil do vendedor no banco de dados
        await setDoc(doc(db, "vendedores", user.uid), {
            nomeLoja: nome,
            email: email,
            tipo: "vendedor",
            dataCriacao: new Date()
        });

        alert("Conta criada com sucesso! Bem-vindo à Milomércios.");
        window.location.href = "admin.html"; // Vai para o painel de postagem

    } catch (error) {
        console.error(error);
        alert("Erro ao criar conta: " + error.message);
    }
});
