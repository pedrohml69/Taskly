import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


const form = document.querySelector("form");

const nameInput = document.querySelector(
    'input[placeholder="Nome"]'
);

const emailInput = document.querySelector(
    'input[placeholder="Email"]'
);

const passwordInput = document.querySelector(
    'input[placeholder="Senha"]'
);

const confirmPasswordInput = document.querySelector(
    'input[placeholder="Confirmar Senha"]'
);


form.addEventListener("submit", async (event) => {

    event.preventDefault();


    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;


    // =========================
    // VALIDAÇÕES
    // =========================

    if (name.length < 2) {
        alert("Digite um nome válido.");
        return;
    }


    if (!email) {
        alert("Digite seu e-mail.");
        return;
    }


    if (password.length < 6) {
        alert(
            "A senha deve possuir pelo menos 6 caracteres."
        );
        return;
    }


    if (password !== confirmPassword) {
        alert("As senhas não coincidem.");
        return;
    }


    try {

        // =========================
        // CRIA USUÁRIO NO AUTH
        // =========================

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user = userCredential.user;


        // =========================
        // SALVA NOME NO AUTH
        // =========================

        await updateProfile(user, {
            displayName: name
        });


        // =========================
        // CRIA PERFIL NO FIRESTORE
        // =========================

        const profileRef = doc(
            db,
            "users",
            user.uid,
            "profile",
            "main"
        );


        await setDoc(profileRef, {

            name: name,

            email: user.email,

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        });


        let deliveryFailed = false;
        let deliveryErrorCode = "";

        try {
            await sendEmailVerification(user, {
                url: new URL("./dashboard.html", window.location.href).href
            });
        } catch (error) {
            deliveryFailed = true;
            deliveryErrorCode = error.code || "unknown";
            console.error("Não foi possível enviar o e-mail de verificação:", error);
        }

        window.location.href = deliveryFailed
            ? `verify-email.html?delivery=failed&reason=${encodeURIComponent(deliveryErrorCode)}`
            : "verify-email.html";


    } catch (error) {

        console.error(
            "Erro ao cadastrar:",
            error
        );


        // =========================
        // ERROS DO FIREBASE
        // =========================

        switch (error.code) {

            case "auth/email-already-in-use":

                alert(
                    "Este e-mail já está em uso."
                );

                break;


            case "auth/invalid-email":

                alert(
                    "Digite um e-mail válido."
                );

                break;


            case "auth/weak-password":

                alert(
                    "A senha é muito fraca."
                );

                break;


            case "auth/network-request-failed":

                alert(
                    "Erro de conexão. Verifique sua internet."
                );

                break;


            case "auth/operation-not-allowed":

                alert(
                    "O cadastro por e-mail e senha está desativado no Firebase Authentication."
                );

                break;


            case "auth/unauthorized-domain":

                alert(
                    "Este domínio não está autorizado nas configurações do Firebase Authentication."
                );

                break;


            case "auth/api-key-not-valid":

            case "auth/invalid-api-key":

            case "auth/project-not-found":

                alert(
                    "A configuração do projeto Firebase está inválida. Confira o projeto e a chave em firebase-config.js."
                );

                break;


            case "permission-denied":

                alert(
                    "A conta do Firebase Authentication pode ter sido criada, mas o perfil foi recusado pelo Firestore. Confira as regras e tente entrar com o mesmo e-mail; não refaça o cadastro."
                );

                break;


            default:

                alert(
                    `Não foi possível concluir o cadastro (código: ${error.code || "desconhecido"}).`
                );

                break;
        }
    }
});