
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


  const firebaseConfig = {
    apiKey: "AIzaSyCkr46_QjGylKZtJgi2jZNpDwgUlk_fNnk",
    authDomain: "recipe-snap-4n9zq.firebaseapp.com",
    projectId: "recipe-snap-4n9zq",
    storageBucket: "recipe-snap-4n9zq.firebasestorage.app",
    messagingSenderId: "616454823870",
    appId: "1:616454823870:web:45c4e640e2cd311589a3ef"
  };

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
