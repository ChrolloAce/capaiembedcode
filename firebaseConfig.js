// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDnSewoxH75cYRPlzjX8SS8SseLTakMl_8",
  authDomain: "capped-ai.firebaseapp.com",
  projectId: "capped-ai",
  storageBucket: "capped-ai.appspot.com",
  messagingSenderId: "897068191530",
  appId: "1:897068191530:web:7e3d4af4908ce717021853"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth }; 