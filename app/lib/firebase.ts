import { initializeUI } from "@firebase-oss/ui-core";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDNgo8t6wJLKfpiGqOSt493dsLoMR9ENB0",
  authDomain: "checklists-486418.firebaseapp.com",
  projectId: "checklists-486418",
  storageBucket: "checklists-486418.firebasestorage.app",
  messagingSenderId: "240319760723",
  appId: "1:240319760723:web:e5a55dd4d542a2e4bef9a6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// connectAuthEmulator(auth, "http://127.0.0.1:9099");
// Initialize Firebase UI v7
export const ui = initializeUI({
  app,
  behaviors: [],
});


export default app;
