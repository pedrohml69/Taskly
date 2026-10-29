import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";

const currentPage = window.location.pathname.split("/").pop();

function getPageUrl(pageName) {
    const isInsidePagesFolder = window.location.pathname.includes("/pages/");

    return isInsidePagesFolder
        ? `./${pageName}`
        : `./pages/${pageName}`;
}

function setCurrentUserProfile(profileData) {
    const safeProfile = profileData || {
        name: "Usuário",
        email: ""
    };

    window.currentUserProfile = {
        name: safeProfile.name || "Usuário",
        email: safeProfile.email || ""
    };

    const accountName = document.querySelector(".account p");

    if (accountName) {
        accountName.textContent = window.currentUserProfile.name;
    }

    if (typeof window.applyUserProfile === "function") {
        window.applyUserProfile(window.currentUserProfile);
    }
}

async function resolveUserProfile(user) {
    if (!user) {
        return {
            name: "Usuário",
            email: ""
        };
    }

    try {
        const profileRef = doc(
            db,
            "users",
            user.uid,
            "profile",
            "main"
        );

        const profileSnapshot = await getDoc(profileRef);

        if (profileSnapshot.exists()) {
            const profileData = profileSnapshot.data();

            return {
                name: profileData.name || user.displayName || "Usuário",
                email: profileData.email || user.email || ""
            };
        }
    } catch (error) {
        console.warn("Não foi possível carregar o perfil do usuário.", error);
    }

    return {
        name: user.displayName || "Usuário",
        email: user.email || ""
    };
}

window.logoutCurrentUser = async function () {
    try {
        await signOut(auth);
        window.location.href = getPageUrl("login.html");
    } catch (error) {
        console.error("Erro ao fazer logout.", error);
        alert("Não foi possível sair da conta no momento.");
    }
};

onAuthStateChanged(auth, async (user) => {
    const protectedPages = ["dashboard.html", "board.html"];
    const authPages = ["login.html", "register.html"];

    if (protectedPages.includes(currentPage) && !user) {
        window.location.href = getPageUrl("login.html");
        return;
    }

    if (authPages.includes(currentPage) && user) {
        window.location.href = getPageUrl("dashboard.html");
        return;
    }

    if (currentPage === "index.html" && user) {
        window.location.href = getPageUrl("dashboard.html");
        return;
    }

    if (user) {
        const profile = await resolveUserProfile(user);
        setCurrentUserProfile(profile);
        return;
    }

    setCurrentUserProfile({
        name: "Usuário",
        email: ""
    });
});
