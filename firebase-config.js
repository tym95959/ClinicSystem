// firebase-config.js - Universal Firebase Configuration (No Auth)

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAdWuyx6tI0bu5FSJelSBTrCPzAEOqM8Sc",
    authDomain: "clinicappser.firebaseapp.com",
    projectId: "clinicappser",
    storageBucket: "clinicappser.firebasestorage.app",
    messagingSenderId: "1003991615080",
    appId: "1:1003991615080:web:8ec314b79ff20a86a89ddd",
    measurementId: "G-MHKJV1L1T6",
    databaseURL: "https://clinicappser-default-rtdb.firebaseio.com"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get Firestore instance
const db = firebase.firestore();

// Get Realtime Database instance
const rtdb = firebase.database();

// Make db and rtdb available globally
window.db = db;
window.rtdb = rtdb;

console.log("✅ Firebase connected (Firestore + Realtime DB)");