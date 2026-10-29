import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { auth } from "./firebase-config.js";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        alert("Informe seu e-mail e senha.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Digite um e-mail válido.");
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "./dashboard.html";
    } catch (error) {
        console.error("Erro ao entrar:", error);

        switch (error.code) {
            case "auth/invalid-email":
                alert("E-mail inválido.");
                break;

            case "auth/user-not-found":
            case "auth/wrong-password":
                alert("E-mail ou senha inválidos.");
                break;

            case "auth/too-many-requests":
                alert("Muitas tentativas. Tente novamente em alguns minutos.");
                break;

            case "auth/network-request-failed":
                alert("Erro de conexão. Verifique sua internet e tente novamente.");
                break;

            default:
                alert("Não foi possível entrar no momento. Tente novamente.");
                break;
        }
    }
});
