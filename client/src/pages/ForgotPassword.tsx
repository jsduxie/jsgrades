// Register page - allows user to create an account

import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { doPasswordReset } from '../firebase/Auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const auth = useAuth();
  const userLoggedIn = auth?.userLoggedIn;

  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isRequested) {
      navigate('/login');
      return;
    }

    if (!isSubmitting) {
      setIsSubmitting(true);
      try {
        await doPasswordReset(email).then(() => {
          setIsRequested(true);
          setIsSubmitting(false);
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMessage(err.message || 'Failed to create account.');
        } else {
          setErrorMessage('Failed to create account.');
        }
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      {userLoggedIn && <Navigate to={'/home'} replace={true} />}

      <main className="w-full h-screen flex self-center place-content-center place-items-center">
        <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border rounded-xl bg-white">
          <Logo />
          <div className="text-center mb-6">
            <div className="mt-2">
              <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">
                Password Reset
              </h3>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
              />
            </div>

            {errorMessage && (
              <p className="text-red-600 text-center w-100 font-bold mb-4">
                {errorMessage}
              </p>
            )}

            {isRequested && (
              <p className="text-[#5ada86] text-center w-100 font-bold mb-4">
                If an account exists with the above email address, an email will
                be sent with a link to reset your password. Sign in below.
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'}`}
            >
              {isSubmitting
                ? 'Requesting...'
                : isRequested
                  ? 'Sign In'
                  : 'Request Password Reset'}
            </button>
            <div className="text-sm text-center">
              Remembered your password? {'   '}
              <Link
                to={'/login'}
                className="text-center text-sm hover:underline font-bold"
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default ForgotPassword;
