import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDz0CTxLFICO7jCJhgVGeiVwZRJPzUPGNo",
  authDomain: "compensation-management-app.firebaseapp.com",
  projectId: "compensation-management-app",
  storageBucket: "compensation-management-app.firebasestorage.app",
  messagingSenderId: "221761403133",
  appId: "1:221761403133:web:b7238b7dee4f5f97bf2694",
  measurementId: "G-R8HQ3907YZ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);