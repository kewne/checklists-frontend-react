import { NavLink } from "react-router";
import type { Route } from "./+types/checklists";
import { useAuth } from "../lib/auth";
import { decodeApiUrl } from "../lib/encoding";
import { ChecklistHome } from "../components/ChecklistHome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Checklists" },
    { name: "description", content: "Manage your checklists" },
  ];
}

export default function Checklists({ params }: Route.ComponentProps) {
  const { user } = useAuth();

  let decodedUrl: string;
  try {
    decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-red-600 mb-4">
              <p className="font-semibold">Error</p>
              <p className="text-sm">Invalid checklists URL. Please go back and try again.</p>
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
          <ChecklistHome href={decodedUrl} user={user!} />
        </div>
      </div>
    </div>
  );
}
