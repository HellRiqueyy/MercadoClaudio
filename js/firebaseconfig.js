// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHyYA4LTmBBCRx0iTwhSFyc1V727Dz-5A",
  authDomain: "mercadinhodoclaudio-35bc0.firebaseapp.com",
  databaseURL: "https://mercadinhodoclaudio-35bc0-default-rtdb.firebaseio.com",
  projectId: "mercadinhodoclaudio-35bc0",
  storageBucket: "mercadinhodoclaudio-35bc0.firebasestorage.app",
  messagingSenderId: "565668027632",
  appId: "1:565668027632:web:26bcbd31f96f73dbb1f635",
  measurementId: "G-5FH06L1PD4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);