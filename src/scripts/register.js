import {
    createUserWithEmailAndPassword,
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


        // =========================
        // REDIRECIONAMENTO
        // =========================

        window.location.href =
            "dashboard.html";


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


            default:

                alert(
                    "Não foi possível realizar o cadastro."
                );

                break;
        }
    }
});