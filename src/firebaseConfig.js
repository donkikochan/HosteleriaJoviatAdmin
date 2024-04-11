// src/firebase-config.js

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCgPdFoAXsEfMELC_6rvmICsXFWemSkZy0",
  authDomain: "hosteleria-app-joviat.firebaseapp.com",
  projectId: "hosteleria-app-joviat",
  storageBucket: "hosteleria-app-joviat.appspot.com",
  messagingSenderId: "510663146644",
  appId: "1:510663146644:web:4b863543b9b59ea4054881",
  measurementId: "G-C462KG0E6V",
};

export const app = initializeApp(firebaseConfig);
