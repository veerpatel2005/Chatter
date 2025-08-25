// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCabXsALLymq8F0ZNQbe1zaBl1e07EyDgI",
  authDomain: "practical-11-de1a8.firebaseapp.com",
  projectId: "practical-11-de1a8",
  storageBucket: "practical-11-de1a8.firebasestorage.app",
  messagingSenderId: "229644633728",
  appId: "1:229644633728:web:6b83a0c3807bc727528865",
  measurementId: "G-J0YYDWPZ0X"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

