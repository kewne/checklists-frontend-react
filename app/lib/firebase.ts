import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { initializeUI } from '@firebase-oss/ui-core';

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDNgo8t6wJLKfpiGqOSt493dsLoMR9ENB0",
  authDomain: "checklists-486418.firebaseapp.com",
  projectId: "checklists-486418",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
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
