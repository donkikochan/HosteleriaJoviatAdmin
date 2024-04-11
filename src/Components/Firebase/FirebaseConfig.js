import firebase from 'firebase/app';
import 'firebase/database'; // Si estás usando Firebase Realtime Database
import 'firebase/firestore'; // Si estás usando Cloud Firestore

const firebaseConfig = {
    apiKey: "AIzaSyCgPdFoAXsEfMELC_6rvmICsXFWemSkZy0",
    authDomain: "hosteleria-app-joviat.firebaseapp.com",
    projectId: "hosteleria-app-joviat",
    storageBucket: "hosteleria-app-joviat.appspot.com",
    messagingSenderId: "510663146644",
    appId: "1:510663146644:web:e924f3e20032c409054881",
    measurementId: "G-X1W5ZH7B43"
};

firebase.initializeApp(firebaseConfig);

export default firebase;