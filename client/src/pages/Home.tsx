// Home / Main Dashboard Page

import React from "react";
import { useAuth } from "../context/AuthContext";
import { doSignOut } from "../firebase/Auth"

const Home = () => {
    const auth = useAuth();

    if (!auth || !auth.currentUser) {
        return <div className='text-2xl font-bold pt-14'>Not logged in.</div>;
    }
    
    const { currentUser } = auth;

    return (
        <div className='text-2xl font-bold pt-14'>
            Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}!
            <button onClick={doSignOut}>Sign Out</button>
        </div>
        
    )
}

export default Home;