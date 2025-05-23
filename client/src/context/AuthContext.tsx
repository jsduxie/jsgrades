// Allows for authentication to be tracked across components

import { onAuthStateChanged, User } from 'firebase/auth';
import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/Firebase';

type AuthContextType = {
  currentUser: User | null;
  userLoggedIn: boolean;
  loading: boolean;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initialiseUser);
    return unsubscribe;
  }, []);

  function initialiseUser(user: User | null) {
    if (user) {
      setCurrentUser(user);
      setUserLoggedIn(true);
    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
    }
    setLoading(false);
  }

  const value = {
    currentUser,
    userLoggedIn,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
}
