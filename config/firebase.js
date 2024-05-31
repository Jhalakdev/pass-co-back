// Import the functions you need from the SDKs you need
const { initializeApp } =require("firebase/app") ;

const { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    sendEmailVerification, 
    sendPasswordResetEmail
  
  } = require("firebase/auth") ;
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCrJbkk-3kQAvo2wjj-oQtcMWtBxJEqqs4",
  authDomain: "passwordmanager-8a388.firebaseapp.com",
  projectId: "passwordmanager-8a388",
  storageBucket: "passwordmanager-8a388.appspot.com",
  messagingSenderId: "527715278975",
  appId: "1:527715278975:web:d382a35b01f95407159f4a",
  measurementId: "G-9KZ5GS9C86"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

module.exports = {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,

  };