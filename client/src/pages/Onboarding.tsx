// Onboarding page - allows user to enter further information if required

import { Datepicker } from 'flowbite-react';
import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/shadcn/DropdownMenu';
import { Logo, datePickerTheme } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

type QualificationLevel = {
  value: number;
  label: string;
};

const educationLevels: QualificationLevel[] = [
  { value: 2, label: 'GCSE' },
  { value: 3, label: 'A-Level' },
  { value: 6, label: 'Undergraduate' },
  { value: 7, label: 'Postgraduate' },
  { value: 0, label: 'Not Applicable' },
];

interface QualificationDropdownProps {
  value: number;
  onChange: (value: number) => void;
}

// Reusable component to display dropdown to select qualification level and store as int based on level
// numbers are based on standard qualification levels in UK
export function QualificationDropdown({
  value,
  onChange,
}: QualificationDropdownProps) {
  const selected = educationLevels.find((lvl) => lvl.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="w-full mt-2 px-3 py-2 text-gray-700 bg-white border rounded-lg shadow-sm flex justify-between items-center transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {selected ? selected.label : 'Select level...'}
          <svg
            className="w-4 h-4 ml-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[var(--radix-dropdown-menu-trigger-width)] bg-white border border-gray-200 rounded-lg shadow-lg mt-2">
        {educationLevels.map((level) => (
          <DropdownMenuItem
            key={level.value}
            onSelect={() => onChange(level.value)}
            className={value === level.value ? 'bg-indigo-100 font-bold' : ''}
          >
            {level.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    qualificationlevel: 0,
  });

  // Controls progression through form, needs further implementation later
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isOnboarded, setIsOnboarded] = useState('');

  const auth = useAuth();
  const currentUser = auth?.currentUser;

  const navigate = useNavigate();

  // Pulls available data from the currentUser obtained from Firebased for improved UX
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

  // Not currently used
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
                    name="firstName"
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
                  <label className="text-sm text-gray-600 font-bold mb-2 block">
                    Highest Education Level
                  </label>
                  <QualificationDropdown
                    value={form.qualificationlevel}
                    onChange={(val) =>
                      setForm((prev) => ({ ...prev, qualificationlevel: val }))
                    }
                  />
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
