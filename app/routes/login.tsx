import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { onAuthStateChanged } from 'firebase/auth';
import { SignInAuthScreen } from '@firebase-oss/ui-react';
import { auth } from '../lib/firebase';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <SignInAuthScreen 
          onSignIn={(user) => {
            navigate('/');
          }}
        />
      </div>
    </div>
  );
}
