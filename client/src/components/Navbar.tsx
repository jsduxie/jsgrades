import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './UI';

interface NavbarProps {
  user: {
    name?: string;
    email: string;
    photoURL?: string;
    displayName?: string;
    first_name?: string;
    last_name?: string;
    created_at?: string;
  };
  onSignOut: () => void;
  onProfileSettings?: () => void;
  logoSrc?: string;
  logoAlt?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSignOut,
  onProfileSettings,
}) => {
  const [isUserModal, setIsUserModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsUserModal(false);
      }
    }

    if (isUserModal) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isUserModal]);

  const getInitials = (firstName?: string, lastName?: string) => {
    let initials = '';

    if (firstName) {
      initials += firstName.trim()[0].toUpperCase();
    } else {
      return initials;
    }

    if (lastName) {
      initials += lastName.trim()[0].toUpperCase();
    }

    return initials;
  };

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : 'N/A';

  return (
    <>
      <header className="w-full h-[75px] bg-[#efefef]/50 opacity-[0.5] shadow-light-1 shadow-light-2 px-6 py-4 flex items-center justify-between z-1">
        <div className="flex items-center space-x-4">
          <Logo
            height={60}
            style="object-contain align-center mt-[25px] ml-[75px]"
          />
        </div>

        <div className="flex items-center space-x-[64px] mr-[25px]">
          <a
            href="/home"
            className="text-md text-gray-600 hover:text-purple-600"
          >
            Home
          </a>
          <a
            href="/support"
            className="text-md text-gray-600 hover:text-purple-600"
          >
            Support
          </a>
          <div className="relative" ref={triggerRef}>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-12 h-12 rounded-full cursor-pointer object-cover"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUserModal(!isUserModal);
                }}
              />
            ) : (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUserModal(!isUserModal);
                }}
                className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer select-none font-semibold"
              >
                {getInitials(user.first_name, user.last_name)}
              </div>
            )}
          </div>
        </div>
      </header>
      {isUserModal && (
        <div
          ref={modalRef}
          className={
            'fixed top-[100px] right-[25px] h-[350px] w-[300px] bg-[#efefef] shadow-light-1 shadow-light-2 z-20 rounded-[12px] flex flex-col items-center justify-start p-[15px] transition-opacity duration-500'
          }
        >
          <p className="height-[50px] mb-[25px] text-sm">{user.email}</p>
          <div className="relative mb-[25px]">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full cursor-pointer object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full text-xl bg-primary text-white flex items-center justify-center cursor-pointer select-none font-semibold">
                {getInitials(user.first_name, user.last_name)}
              </div>
            )}
          </div>
          <p className="text-xl font-bold">{`${user.first_name} ${user.last_name}`}</p>
          <p className="text-sm mt-[5px]">{`Member Since ${memberSince}`}</p>
          <div className="flex justify-around w-full mt-[20px]">
            <button
              onClick={onSignOut}
              className="mt-6 bg-red-500 hover:bg-red-600 transition-300 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
            <button
              onClick={onProfileSettings}
              className="mt-6 bg-primary  text-white py-2 px-4 rounded hover:bg-secondary"
            >
              Profile Settings
            </button>
          </div>
        </div>
      )}
    </>
  );
};
