// Firebase setup credentials

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDbrdGqWNQXx35vdJus39wb87aa0n3f3iw',
  authDomain: 'jsgrades-e0483.firebaseapp.com',
  projectId: 'jsgrades-e0483',
  storageBucket: 'jsgrades-e0483.firebasestorage.app',
  messagingSenderId: '836068302288',
  appId: '1:836068302288:web:4cfd9ad3eb1fc6b58c6dd5',
  measurementId: 'G-8W0MR89V37',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
