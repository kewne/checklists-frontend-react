import { SignInAuthScreen } from '@firebase-oss/ui-react';
import { Link, useNavigate } from 'react-router';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <SignInAuthScreen
          onSignIn={() => {
            navigate('/');
          }
          }
        />
        <div className="text-center mt-4">
          <Link to="/reset-password" className="text-blue-600 hover:underline text-sm">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
