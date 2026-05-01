import { Link, useNavigate } from "react-router";
import type { Route } from "../+types/checklist-create";
import { useAuth } from "../../lib/auth";
import { decodeApiUrl } from "../../lib/encoding";
import { ChecklistForm } from "../../components/ChecklistForm";
import { useResource } from "../../lib/useResource";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Checklist" },
    { name: "description", content: "Create a new checklist" },
  ];
}

export function ErrorBoundary({}: Route.ErrorBoundaryProps) {
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
          <Link
            to="/"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CreateChecklist({ params }: Route.ComponentProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);

  const { post } = useResource(decodedUrl, user!);

  const handleSubmit = async (data: {
    title: string;
    items: Array<{ title: string; description: string }>;
  }) => {
    await post(data);
    navigate(`/checklists/list/${params.apiUrlEncoded}`);
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create New Checklist
      </h1>
      <ChecklistForm
        submitLabel="Create"
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/checklists/list/${params.apiUrlEncoded}`)}
      />
    </>
  );
}
