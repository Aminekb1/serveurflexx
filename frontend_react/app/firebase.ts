// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAjmrfnNfnkt2EiLdAXkEzNXhKp0dpcVm0",
  authDomain: "projet-8af42.firebaseapp.com",
  projectId: "projet-8af42",
  storageBucket: "projet-8af42.firebasestorage.app",
  messagingSenderId: "964170179586",
  appId: "1:964170179586:web:120bd60bdd6abc7a2a331b",
  measurementId: "G-E47DV0RRCM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
// Exporter les services nécessaires (par exemple, Storage pour les images)
export const storage = getStorage(app);