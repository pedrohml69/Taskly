import {
	signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { auth } from "./firebase-config.js";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitButton = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	const email = emailInput.value.trim();
	const password = passwordInput.value;

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
		alert("Informe um e-mail válido e sua senha.");
		return;
	}

	submitButton.disabled = true;

	try {
		const credential = await signInWithEmailAndPassword(auth, email, password);
		window.location.href = credential.user.emailVerified
			? "./dashboard.html"
			: "./verify-email.html";
	} catch (error) {
		console.error("Não foi possível entrar:", error);

		if (error.code === "auth/network-request-failed") {
			alert("Erro de conexão. Verifique sua internet e tente novamente.");
		} else if (error.code === "auth/too-many-requests") {
			alert("Muitas tentativas. Aguarde um pouco e tente novamente.");
		} else if (error.code === "auth/operation-not-allowed") {
			alert("O login por e-mail e senha está desativado no Firebase Authentication.");
		} else if (error.code === "auth/unauthorized-domain") {
			alert("Este domínio não está autorizado nas configurações do Firebase Authentication.");
		} else if (error.code === "auth/user-disabled") {
			alert("Esta conta está desativada. Entre em contato com o suporte.");
		} else if (
			error.code === "auth/api-key-not-valid" ||
			error.code === "auth/invalid-api-key" ||
			error.code === "auth/project-not-found"
		) {
			alert("A configuração do projeto Firebase está inválida. Confira firebase-config.js.");
		} else if (
			error.code === "auth/invalid-credential" ||
			error.code === "auth/wrong-password" ||
			error.code === "auth/user-not-found" ||
			error.code === "auth/invalid-email"
		) {
			alert("E-mail ou senha inválidos.");
		} else {
			alert(`Não foi possível entrar (código: ${error.code || "desconhecido"}).`);
		}
	} finally {
		submitButton.disabled = false;
	}
});
