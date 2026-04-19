import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { useAuth } from "../lib/auth";
import { ChecklistHome } from "../components/ChecklistHome";
import { ChecklistInstanceList } from "../components/ChecklistInstanceList";
import { useResource } from "~/lib/useResource";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Checklists" },
    { name: "description", content: "Manage your checklists" },
  ];
}

function ApiStatusBox({ user }: { user: any }) {
  const { state } = useResource('https://api.checklists.keeoon.dev/', user);

  let status;
  if (state.status === 'loading') {
    status = (
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-blue-700 text-sm">Checking API connection...</span>
        </div>
      </div>
    );
  } else if (state.status === 'success') {
    const checklistsLink = state.resource.getNamedLink('related', 'checklists');
    const instancesLink = state.resource.getNamedLink('related', 'checklist-instances');
    status = (
      <>
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-700 text-sm font-medium">API connection successful</span>
          </div>
        </div>
        {checklistsLink && <ChecklistHome href={checklistsLink.href} user={user} />}
        {instancesLink && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Checklist Instances</h3>
            <ChecklistInstanceList href={instancesLink.href} user={user} />
          </>
        )}
      </>
    );
  } else {
    status = (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
        <div className="flex items-center">
          <svg className="h-4 w-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-700 text-sm font-medium">API connection failed</span>
          {state.status === 'error' && <span className="text-red-600 text-sm ml-2">({state.error.message})</span>}
        </div>
      </div>
    );
  }
  return <div role="status" aria-label="api connection status">
    {status}
  </div>
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
            <ApiStatusBox user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
