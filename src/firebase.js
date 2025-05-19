// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {getFirestore} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDaUH0BHunyh1cUzriSkHvMP121xAxDP7c",
  authDomain: "czj-volleyball-system.firebaseapp.com",
  projectId: "czj-volleyball-system",
  storageBucket: "czj-volleyball-system.firebasestorage.app",
  messagingSenderId: "131760012015",
  appId: "1:131760012015:web:62ae2362442f6aa035791a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };