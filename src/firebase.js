import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDJWrsRZIxc6ugIH8GgwEeJVRIurTL_s7Q",
  authDomain: "katalog-e11bc.firebaseapp.com",
  projectId: "katalog-e11bc",
  storageBucket: "katalog-e11bc.firebasestorage.app",
  messagingSenderId: "110559853641",
  appId: "1:110559853641:web:962d4f485c6c0d8f3b1398"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);