import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { useAuth } from "../lib/auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
        <Welcome />
        <div className="space-x-4">
          <Link
            to="/login"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
              <p className="text-gray-600 mt-1">
                Signed in as: <span className="font-medium">{user.email}</span>
              </p>
            </div>
            <button
              onClick={signOut}
              className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Dashboard</h2>
            <p className="text-gray-600">
              You're successfully authenticated with Firebase UI! You can now start building your application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
