import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC-TcBk03-rnRKCAvxJNX2thOqKoD6iK9M",
  authDomain: "recipe-app-811bb.firebaseapp.com",
  projectId: "recipe-app-811bb",
  storageBucket: "recipe-app-811bb.firebasestorage.app",
  messagingSenderId: "9134917071",
  appId: "1:9134917071:web:7b70acdd2abec8b61f3eba"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Signup handler
const signUpBtn = document.getElementById('sign');
if (signUpBtn) {
    signUpBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const signupEmail = document.getElementById('signupEmail').value;
        const signupPassword = document.getElementById('signupPassword').value;

        createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Signup successful:", user);
                alert("Sign up successful");
            })
            .catch((err) => {
                console.error("Signup error:", err.message);
                alert("Signup failed: " + err.message);
            });
    });
}

// Login handler
const loginBtn = document.getElementById('btn1');
if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const loginEmail = document.getElementById('loginEmail').value;
        const loginPassword = document.getElementById('loginPassword').value;

        signInWithEmailAndPassword(auth, loginEmail, loginPassword)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Login successful:", user);
                alert("Login successful");
            })
            .catch((err) => {
                console.error("Login error:", err.message);
                alert("Login failed: " + err.message);
            });
    });
}

// Authentication status listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user.email);
    } else {
        console.log("No user is logged in.");
    }
});
