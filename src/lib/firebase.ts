
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "recipe-snap-4n9zq",
  appId: "1:616454823870:web:45c4e640e2cd311589a3ef",
  storageBucket: "recipe-snap-4n9zq.firebasestorage.app",
  apiKey: "AIzaSyCkr46_QjGylKZtJgi2jZNpDwgUlk_fNnk",
  authDomain: "recipe-snap-4n9zq.firebaseapp.com",
  messagingSenderId: "616454823870",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
