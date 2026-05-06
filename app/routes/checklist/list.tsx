import { Link, NavLink } from "react-router";
import { ChecklistList } from "~/components/ChecklistList";
import { useAuth } from "../../lib/auth";
import { decodeApiUrl } from "../../lib/encoding";
import type { Route } from "./+types/list";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Checklists" },
    { name: "description", content: "Manage your checklists" },
  ];
}

export function ErrorBoundary({ }: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">
              Invalid checklists URL. Please go back and try again.
            </p>
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

export default function List({ params }: Route.ComponentProps) {
  const { user } = useAuth();

  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);


  return (
    <div>
      <Link
        to={`/checklists/create/${params.apiUrlEncoded}`}
        className="inline-block mb-4 bg-indigo-600 px-4 py-2 rounded-md font-medium text-white hover:bg-indigo-700"
      >
        Create Checklist
      </Link>
      <ChecklistList href={decodedUrl} user={user} />
    </div>
  );
}
