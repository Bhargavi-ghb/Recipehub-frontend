import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCJ8MmM92bZQ2majwblLdQaEeSpEksozGQ",
  authDomain: "recipehub-dc535.firebaseapp.com",
  projectId: "recipehub-dc535",
  storageBucket: "recipehub-dc535.appspot.com",
  messagingSenderId: "212858617628",
  appId: "1:212858617628:web:fd675ccdec374c4026c4d9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Helper function to save user info to backend
async function saveUserAndRedirect(firebaseUid, email, name) {
  try {
    const response = await fetch('https://recipehub-backend-1.onrender.com/Users/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseUid, email, name }),
    });

    if (!response.ok) throw new Error("Failed to save user to backend");

    const data = await response.json();
    localStorage.setItem("userId", data.id);
    console.log("User saved:", data);
    window.location.href = "/home.html";
  } catch (error) {
    alert("Error saving user: " + error.message);
    console.error(error);
  }
}

// -------------------- SIGNUP --------------------
const signUpBtn = document.getElementById('Signup-btn1');
if (signUpBtn) {
  signUpBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const signupEmail = document.getElementById('signupEmail').value.trim();
    const signupPassword = document.getElementById('signupPassword').value.trim();
    const name = document.getElementById('signupName')?.value.trim() || "No Name";

    // Validation
    if (!signupEmail || !signupPassword || !name) {
      alert("Please fill out all the fields.");
      return;
    }

    if (signupPassword.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const user = userCredential.user;

      await saveUserAndRedirect(user.uid, signupEmail, name);
      alert("Signup successful!");
    } catch (error) {
      alert("Signup failed: " + error.message);
      console.error(error);
    }
  });
}

// -------------------- LOGIN --------------------
const loginBtn = document.getElementById('login-btn1');
if (loginBtn) {
  loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const loginEmail = document.getElementById('loginEmail').value.trim();
    const loginPassword = document.getElementById('loginPassword').value.trim();

    // Validation
    if (!loginEmail || !loginPassword) {
      alert("Please enter both email and password.");
      return;
    }

    if (loginPassword.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const user = userCredential.user;

      const response = await fetch('https://recipehub-backend-1.onrender.com/Users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: user.uid }),
      });

      if (!response.ok) throw new Error("User not authorized");

      const userData = await response.json();
      localStorage.setItem("userId", userData.id);

      alert("Login successful!");
      window.location.href = "/home.html";
    } catch (error) {
      alert("Login failed: " + error.message);
      console.error(error);
    }
  });
}

// -------------------- GOOGLE LOGIN --------------------
const googleLoginBtn = document.getElementById('google-btn1');
if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await saveUserAndRedirect(user.uid, user.email, user.displayName || "Google User");
      alert("Google login successful!");
      window.location.href = "/home.html";
    } catch (error) {
      alert("Google login failed: " + error.message);
      console.error(error);
    }
  });
}

// -------------------- ANONYMOUS LOGIN --------------------
const anonymousLoginBtn = document.getElementById('anonymous-btn1');
if (anonymousLoginBtn) {
  anonymousLoginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      await saveUserAndRedirect(user.uid, "anonymous@guest.com", "Guest User");
      sessionStorage.setItem("guestLogin", "true");
      alert("Logged in as Guest.");
      window.location.href = "/home.html";
    } catch (error) {
      alert("Anonymous login failed: " + error.message);
      console.error(error);
    }
  });
}

// -------------------- AUTH STATE CHANGE --------------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const response = await fetch('https://recipehub-backend-1.onrender.com/Users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: user.uid }),
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("User logged in. Internal User ID:", userData.id);
      } else {
        console.error("User not found in backend");
      }
    } catch (error) {
      console.error("Auth state change error:", error);
    }
  } else {
    console.log("No user logged in");
  }
});

// -------------------- ADMIN LOGIN --------------------
const adminBtn = document.getElementById('admin-btn');

if (adminBtn) {
  adminBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
      alert("Please enter admin email and password.");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.email === "admin@recipehub.com") {
        alert("Admin login successful!");
        localStorage.setItem("isAdmin", "true");
        window.location.href = "./admin.html";
      } else {
        alert("Access denied: Not an admin user.");
      }
    } catch (error) {
      alert("Admin login failed: " + error.message);
      console.error(error);
    }
  });
}
