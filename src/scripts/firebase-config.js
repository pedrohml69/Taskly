import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBUNik81vjk3nMqx3WlaCdMcWng2-GivvM",
    authDomain: "taskly-c3908.firebaseapp.com",
    projectId: "taskly-c3908",
    storageBucket: "taskly-c3908.firebasestorage.app",
    messagingSenderId: "940779329735",
    appId: "1:940779329735:web:2209dbb8678b5da2a586e2",
    measurementId: "G-WR5J76FW95"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);