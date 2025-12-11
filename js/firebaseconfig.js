// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBM56jnL-3XyviHhDZt0dnykqMXVIAhryU",
  authDomain: "mercadoclaudio-65acf.firebaseapp.com",
  databaseURL: "https://mercadoclaudio-65acf-default-rtdb.firebaseio.com",
  projectId: "mercadoclaudio-65acf",
  storageBucket: "mercadoclaudio-65acf.firebasestorage.app",
  messagingSenderId: "12300229934",
  appId: "1:12300229934:web:2879287d5ab90b73c6eebf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);

export { app, db }