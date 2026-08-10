import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXxFbgL_btQ0WDQtIcggwF_6ZI6iMMSwg",
  authDomain: "mostafa-5edd1.firebaseapp.com",
  projectId: "mostafa-5edd1",
  storageBucket: "mostafa-5edd1.firebasestorage.app",
  messagingSenderId: "3490968123",
  appId: "1:3490968123:web:fdafd86f1e4c8bc1f6621e",
  measurementId: "G-QCZHREYJ2L"
};

// Initialize Firebase only once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
