// Home / Main Dashboard Page

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doSignOut } from '../firebase/Auth';

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

const Home = () => {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const auth = useAuth();

  const currentUser = auth?.currentUser;

  useEffect(() => {
    if (!currentUser) return; // Guard clause

    const fetchUserDetails = async () => {
      try {
        console.log(REACT_APP_API_URL);
        const res = await fetch(`${REACT_APP_API_URL}/user/${currentUser.uid}`);

        if (res.status === 404) {
          console.log('User not found');
          throw new Error(`User not found: ${res.json()}`);
          // TODO: route to /onboarding
        }

        if (!res.ok)
          throw new Error(`Failed to fetch user details: ${res.json()}`);

        const data = await res.json();
        setUserDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [currentUser]);

  if (!auth || !auth.currentUser) {
    return <div className="text-2xl font-bold pt-14">Not logged in.</div>;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!userDetails) return <div>No user details found.</div>;
  if (userDetails) return <div>{userDetails.uid}</div>;

  return null;
};

export default Home;
