import {
    confirmPasswordReset,
    verifyPasswordResetCode
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { auth } from "./firebase-config.js";

const form = document.getElementById("resetPasswordForm");
const passwordInput = document.getElementById("newPassword");
const confirmationInput = document.getElementById("confirmPassword");
const statusElement = document.getElementById("resetStatus");
const noticeElement = document.getElementById("resetNotice");
const emailElement = document.getElementById("resetEmail");
const loginReturn = document.getElementById("loginReturn");
const requestAnother = document.getElementById("requestAnother");
const submitButton = document.getElementById("confirmReset");
const parameters = new URLSearchParams(window.location.search);
const actionCode = parameters.get("oobCode");
const mode = parameters.get("mode");

function showNotice(message, isError = false) {
    noticeElement.textContent = message;
    noticeElement.dataset.state = isError ? "error" : "info";
    requestAnother.hidden = !isError;
}

for (const toggle of document.querySelectorAll(".password-toggle")) {
    toggle.addEventListener("click", () => {
        const input = document.getElementById(toggle.dataset.target);
        const visible = input.type === "password";
        input.type = visible ? "text" : "password";
        toggle.textContent = visible ? "Ocultar" : "Mostrar";
        toggle.setAttribute(
            "aria-label",
            `${visible ? "Ocultar" : "Mostrar"} ${input.id === "newPassword" ? "nova senha" : "confirmação da senha"}`
        );
    });
}

if (mode !== "resetPassword" || !actionCode) {
    showNotice("O link de redefinição está incompleto ou inválido.", true);
} else {
    try {
        const email = await verifyPasswordResetCode(auth, actionCode);
        emailElement.textContent = email;
        form.hidden = false;
        noticeElement.hidden = true;
        window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
        console.error("O link de redefinição é inválido ou expirou:", error);
        showNotice("Este link é inválido, expirou ou já foi usado.", true);
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newPassword = passwordInput.value;
    const confirmation = confirmationInput.value;

    if (newPassword.length < 6) {
        statusElement.textContent = "A senha deve possuir pelo menos 6 caracteres.";
        statusElement.dataset.state = "error";
        passwordInput.focus();
        return;
    }

    if (newPassword !== confirmation) {
        statusElement.textContent = "As senhas não coincidem.";
        statusElement.dataset.state = "error";
        confirmationInput.focus();
        return;
    }

    submitButton.disabled = true;
    statusElement.textContent = "Salvando nova senha...";
    statusElement.dataset.state = "loading";

    try {
        await confirmPasswordReset(auth, actionCode, newPassword);
        passwordInput.value = "";
        confirmationInput.value = "";
        form.hidden = true;
        noticeElement.hidden = false;
        loginReturn.hidden = false;
        showNotice("Sua senha foi alterada. Agora você pode entrar com a nova senha.");
        requestAnother.hidden = true;
    } catch (error) {
        console.error("Não foi possível redefinir a senha:", error);

        if (error.code === "auth/weak-password") {
            statusElement.textContent = "A senha não atende aos requisitos mínimos.";
        } else if (error.code === "auth/expired-action-code" || error.code === "auth/invalid-action-code") {
            form.hidden = true;
            noticeElement.hidden = false;
            showNotice("Este link é inválido, expirou ou já foi usado.", true);
        } else if (error.code === "auth/network-request-failed") {
            statusElement.textContent = "Erro de conexão. Verifique sua internet e tente novamente.";
        } else {
            statusElement.textContent = "Não foi possível alterar a senha. Solicite um novo link e tente novamente.";
        }

        statusElement.dataset.state = "error";
    } finally {
        submitButton.disabled = false;
    }
});
