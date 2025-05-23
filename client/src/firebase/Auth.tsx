// Wrappers for Firebase Authentication methods

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from './Firebase';

export const doCreateUserWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const doSignInWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result;
};

export const doSignOut = () => {
  return auth.signOut();
};

export const doPasswordReset = (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const doPasswordChange = (password: string) => {
  if (!auth.currentUser) {
    return Promise.reject(new Error('No authenticated user.'));
  }
  return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = () => {
  if (!auth.currentUser) {
    return Promise.reject(new Error('No authenticated user.'));
  }
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/home`,
  });
};
