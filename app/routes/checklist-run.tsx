import { NavLink, useNavigate } from "react-router";
import { ChecklistRunDetail } from "../components/ChecklistRunDetail";
import { useAuth } from "../lib/auth";
import { decodeApiUrl } from "../lib/encoding";
import { useResource } from "../lib/useResource";
import type { Route } from "./+types/checklist-run";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Checklist Run" },
    { name: "description", content: "View checklist run details" },
  ];
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{String(error)}</p>
          </div>
          <NavLink
            to="/"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700"
          >
            Back to Home
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default function ChecklistRun({ params }: Route.ComponentProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);

  const { state, get, delete: del } = useResource(decodedUrl, user!);

  const doDelete = async () => {
    await del()
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow p-6">
        {state.status === "loading" && (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
            <span className="text-gray-600">Loading run...</span>
          </div>
        )}

        {state.status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-semibold">Failed to load run</p>
            <p className="text-red-600 text-sm mt-1">{state.error.message}</p>
          </div>
        )}

        {state.status === "success" && (
          <ChecklistRunDetail resource={state.resource} user={user!} onItemUpdated={get} onDelete={doDelete} />
        )}
      </div>
    </div>
  );
}
