// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDirEpj1Aku8NPEjTSndQR08OWMn2U7jw",
  authDomain: "lost-and-found-app-9133e.firebaseapp.com",
  projectId: "lost-and-found-app-9133e",
  storageBucket: "lost-and-found-app-9133e.appspot.com",
  messagingSenderId: "563551613447",
  appId: "1:563551613447:web:693b7c6319897c98b830a2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Enable session persistence
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log('Persistence set to browserSessionPersistence');
  })
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
