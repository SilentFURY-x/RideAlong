import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAu2di7V_txkv4Pwd4GyAyBEq98ZUCikDY",
  authDomain: "ridealong2-fury.firebaseapp.com",
  projectId: "ridealong2-fury",
  storageBucket: "ridealong2-fury.firebasestorage.app",
  messagingSenderId: "360429209250",
  appId: "1:360429209250:web:dab43422123887a3d179fb"
};

// Initialize Firebase (Singleton pattern to avoid re-initialization errors)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };