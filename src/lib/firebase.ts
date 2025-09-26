import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDrxCvE0emRt8DWO8XomovD6nQQf4C_12A",
  authDomain: "khyaalaat-1929a.firebaseapp.com",
  projectId: "khyaalaat-1929a",
  storageBucket: "khyaalaat-1929a.appspot.com",
  messagingSenderId: "622579178841",
  appId: "1:622579178841:web:e4422257150572e2824048",
  measurementId: "G-13CB1384X8"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
