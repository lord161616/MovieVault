
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCYJ6oHUDR2YB-sXeujp3uLjQH5hQ7zS0o',
  authDomain: 'movievault-a1a65.firebaseapp.com',
  projectId: 'movievault-a1a65',
  storageBucket: 'movievault-a1a65.firebasestorage.app',
  messagingSenderId: '259907208497',
  appId: '1:259907208497:web:46220366df58596a289c10'
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

