import {
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { auth } from "./firebase-config.js";

const form = document.getElementById("forgotPasswordForm");
const emailInput = document.getElementById("email");
const sendButton = document.getElementById("sendResetLink");
const statusElement = document.getElementById("requestStatus");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        statusElement.textContent = "Digite um endereço de e-mail válido.";
        statusElement.dataset.state = "error";
        emailInput.focus();
        return;
    }

    sendButton.disabled = true;
    statusElement.textContent = "Enviando solicitação...";
    statusElement.dataset.state = "loading";

    try {
        await sendPasswordResetEmail(auth, email, {
            url: new URL("./login.html", window.location.href).href
        });
        statusElement.textContent = "Se houver uma conta com esse e-mail, enviaremos um link para redefinir a senha.";
        statusElement.dataset.state = "success";
    } catch (error) {
        if (error.code !== "auth/user-not-found") {
            console.error("Não foi possível solicitar a redefinição:", error);
        }

        if (error.code === "auth/network-request-failed") {
            statusElement.textContent = "Erro de conexão. Verifique sua internet e tente novamente.";
            statusElement.dataset.state = "error";
        } else if (error.code === "auth/too-many-requests") {
            statusElement.textContent = "Muitas solicitações. Aguarde um pouco e tente novamente.";
            statusElement.dataset.state = "error";
        } else if (error.code === "auth/invalid-email") {
            statusElement.textContent = "Digite um endereço de e-mail válido.";
            statusElement.dataset.state = "error";
        } else {
            statusElement.textContent = "Se houver uma conta com esse e-mail, enviaremos um link para redefinir a senha.";
            statusElement.dataset.state = "success";
        }
    } finally {
        sendButton.disabled = false;
    }
});
