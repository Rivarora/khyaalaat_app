import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  "projectId": "khyaalaat-1929a",
  "appId": "UPDATE_WITH_YOUR_APP_ID",
  "storageBucket": "khyaalaat-1929a.appspot.com",
  "apiKey": "UPDATE_WITH_YOUR_API_KEY",
  "authDomain": "khyaalaat-1929a.firebaseapp.com",
  "measurementId": "UPDATE_WITH_YOUR_MEASUREMENT_ID",
  "messagingSenderId": "UPDATE_WITH_YOUR_MESSAGING_SENDER_ID"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
