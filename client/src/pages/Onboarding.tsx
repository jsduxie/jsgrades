// Register page - allows user to create an account

import { Datepicker } from 'flowbite-react';
import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/shadcn/DropdownMenu';
import { Logo, datePickerTheme, customDropdownTheme } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { doCreateUserWithEmailAndPassword } from '../firebase/Auth';

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    qualificationlevel: '',
  });

  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isOnboarded, setIsOnboarded] = useState('');

  const auth = useAuth();
  const userLoggedIn = auth?.userLoggedIn;
  const currentUser = auth?.currentUser;

  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        email: currentUser.email || '',
        firstName: currentUser.displayName
          ? currentUser.displayName.split(' ')[0]
          : '',
        lastName: currentUser.displayName
          ? currentUser.displayName.split(' ').slice(1).join(' ')
          : '',
      }));
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setErrorMessage('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMessage('No user is logged in.');
      return;
    }
    try {
      const res = await fetch(`${REACT_APP_API_URL}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: currentUser.uid,
          email: form.email,
          first_name: form.firstName,
          last_name: form.lastName,
          date_of_birth: form.dateOfBirth,
          highest_qual_level: form.qualificationlevel,
          onBoarded: true,
        }),
      });
      if (!res.ok) throw new Error('Failed to create user');
      navigate('/home');
    } catch (err) {
      setErrorMessage('Failed to complete onboarding');
    }
  };

  return (
    <>
      <main className="w-full h-screen flex self-center place-content-center place-items-center">
        <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border rounded-xl bg-white">
          <Logo />
          <div className="text-center mb-6">
            <div className="mt-2">
              <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">
                Account Setup
              </h3>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 0 && (
              <p className="text-center mb-4">
                Let's finish setting up your account.
              </p>
            )}
            {step === 1 && (
              <>
                <div>
                  <label className="text-sm text-gray-600 font-bold">
                    First Name
                  </label>
                  <input
                    type="text"
                    autoComplete="First Name"
                    required
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-bold">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    autoComplete="Last Name"
                    required
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-bold">
                    Email
                  </label>
                  <input
                    name="email"
                    type="text"
                    autoComplete="Email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full mt-2 px-3 py-2 text-gray-500 outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300 ${
                      currentUser?.email ? 'bg-gray-100' : 'bg-white'
                    }`}
                    readOnly={!!currentUser?.email}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="text-sm text-gray-600 font-bold">
                    Date of Birth
                  </label>
                  <Datepicker
                    theme={datePickerTheme.datepicker}
                    value={
                      form.dateOfBirth ? new Date(form.dateOfBirth) : undefined
                    }
                    onChange={(date: Date | null) =>
                      setForm((prev) => ({
                        ...prev,
                        dateOfBirth: date
                          ? date.toISOString().split('T')[0]
                          : '',
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-bold">
                    Highest Education Level
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger>Open</DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                      <DropdownMenuItem>Billing</DropdownMenuItem>
                      <DropdownMenuItem>Team</DropdownMenuItem>
                      <DropdownMenuItem>Subscription</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
            <button
              type={step == 2 ? 'submit' : 'button'}
              onClick={step == 2 ? undefined : handleNext}
              disabled={isValidating}
              className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isValidating ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'}`}
            >
              {isValidating
                ? 'Loading...'
                : step == 2
                  ? 'Submit'
                  : step == 0
                    ? 'Begin'
                    : 'Next'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default Onboarding;
