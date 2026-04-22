import { NavLink } from "react-router";
import type { Route } from "./+types/checklist-instances";
import { useAuth } from "../lib/auth";
import { decodeApiUrl } from "../lib/encoding";
import { ChecklistInstanceList } from "../components/ChecklistInstanceList";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Checklist Runs" },
    { name: "description", content: "View checklist runs" },
  ];
}

export function ErrorBoundary({}: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">Invalid URL. Please go back and try again.</p>
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

export default function ChecklistInstances({ params }: Route.ComponentProps) {
  const { user } = useAuth();

  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <NavLink
            to="/"
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            ← Back to Home
          </NavLink>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Checklist Runs</h1>
          <ChecklistInstanceList href={decodedUrl} user={user!} />
        </div>
      </div>
    </div>
  );
}
