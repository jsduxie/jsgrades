// Home / Main Dashboard Page

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { doSignOut } from '../firebase/Auth';

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

interface UserDetails {
  uid: string;
  email: string;
  onboarded: boolean;
  name?: string;
  createdAt?: string;
  photoURL?: string;
  displayName?: string;
}

const Home = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const auth = useAuth();

  const currentUser = auth?.currentUser;

  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserDetails = async () => {
      try {
        const res = await fetch(`${REACT_APP_API_URL}/user/${currentUser.uid}`);

        if (res.status === 404) {
          navigate('/onboarding');
          return;
        }

        const data = await res.json();
        console.log(data);
        setUserDetails(data);

        if (!data.onboarded && !loading) {
          navigate('/onboarding');
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [currentUser, navigate, loading]);

  if (!auth || !auth.currentUser) {
    return <div className="text-2xl font-bold pt-14">Not logged in.</div>;
  }

  if (userDetails)
    return (
      <>
        <Navbar
          user={userDetails}
          onSignOut={doSignOut}
          onProfileSettings={() => navigate('/profile-settings')}
          logoSrc=""
          logoAlt=""
        />
        <Sidebar />
      </>
    );

  return null;
};

export default Home;
