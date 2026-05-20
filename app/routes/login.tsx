import { SignInAuthScreen } from "@firebase-oss/ui-react";
import { Link, redirect, useRevalidator } from "react-router";
import { auth } from "~/lib/firebase";

export async function clientLoader() {
  await auth.authStateReady()
  if (auth.currentUser) {
    return redirect("/");
  }
}

export default function Login() {
  const {revalidate} = useRevalidator()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <SignInAuthScreen onSignIn={revalidate} />
        <div className="text-center mt-4">
          <Link
            to="/reset-password"
            className="text-blue-600 hover:underline text-sm"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
