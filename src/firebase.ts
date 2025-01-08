import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyDULf3XSwiiFQZ7q_M9YNieDbWZNLnO7Nw",
    authDomain: "myapp-415315.firebaseapp.com",
    databaseURL: "https://myapp-415315-default-rtdb.firebaseio.com",
    projectId: "myapp-415315",
    storageBucket: "myapp-415315.appspot.com",
    messagingSenderId: "103002319588",
    appId: "1:103002319588:web:88b07fe357fa38904e1af1",
    measurementId: "G-6F293PBLHK"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, updateDoc, doc };
