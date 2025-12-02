 import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyB9Bb5XCQ4CSARFIn0Nmp_h56vJ0NDkpcU",
    authDomain: "login-89019.firebaseapp.com",
    projectId: "login-89019",
    storageBucket: "login-89019.firebasestorage.app",
    messagingSenderId: "342909176790",
    appId: "1:342909176790:web:583d43c716c8205f777277"
  };

  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db = getFirestore(app);