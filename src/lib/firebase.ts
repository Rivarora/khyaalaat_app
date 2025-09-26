import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  "projectId": "studio-4677355997-6e54c",
  "appId": "1:507454652915:web:d22350a5794a1481e79286",
  "storageBucket": "studio-4677355997-6e54c.appspot.com",
  "apiKey": "AIzaSyB3K_5g5xcyPNKGOIq8XambSFbS8iACMnc",
  "authDomain": "studio-4677355997-6e54c.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "507454652915"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
