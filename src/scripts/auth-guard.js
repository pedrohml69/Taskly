import {
	getIdToken,
	onAuthStateChanged,
	reload,
	signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
	doc,
	getDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";

const privatePages = new Set(["dashboard.html", "board.html"]);
const currentPage = window.location.pathname.split("/").pop();

window.currentUserProfile = {
	name: "Usuário",
	email: ""
};

async function loadCurrentUserProfile(user) {
	let profile = {
		name: user.displayName || "Usuário",
		email: user.email || ""
	};

	try {
		const profileSnapshot = await getDoc(
			doc(db, "users", user.uid, "profile", "main")
		);

		if (profileSnapshot.exists()) {
			const profileData = profileSnapshot.data();
			profile = {
				name: profileData.name || profile.name,
				email: profileData.email || profile.email
			};
		}
	} catch (error) {
		console.error("Não foi possível carregar o perfil do usuário:", error);
	}

	window.currentUserProfile = profile;

	if (typeof window.applyUserProfile === "function") {
		window.applyUserProfile(profile);
	}
}

window.logoutCurrentUser = async function () {
	try {
		await signOut(auth);
		window.location.replace("./login.html");
	} catch (error) {
		console.error("Não foi possível encerrar a sessão:", error);
		alert("Não foi possível sair da conta. Tente novamente.");
	}
};

if (privatePages.has(currentPage)) {
	onAuthStateChanged(auth, async (user) => {
		if (!user) {
			window.location.replace("./login.html");
			return;
		}

		const wasVerified = user.emailVerified;

		try {
			await reload(user);
		} catch (error) {
			console.error("Não foi possível confirmar a sessão:", error);
			window.location.replace("./verify-email.html?refresh=failed");
			return;
		}

		if (!user.emailVerified) {
			window.location.replace("./verify-email.html");
			return;
		}

		if (!wasVerified) {
			try {
				await getIdToken(user, true);
			} catch (error) {
				console.error("Não foi possível atualizar o token da sessão:", error);
				window.location.replace("./verify-email.html?refresh=failed");
				return;
			}

			window.location.reload();
			return;
		}

		await loadCurrentUserProfile(user);
	});
}
