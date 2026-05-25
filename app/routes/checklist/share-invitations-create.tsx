import { useNavigate } from "react-router";
import { Link } from "~/components/Link";
import { useAuth } from "../../lib/auth";
import { decodeApiUrl } from "../../lib/encoding";
import { apiResourceActions } from "~/lib/api";
import { showErrorToast, showSuccessToast } from "../../lib/toastHelpers";
import type { Route } from "./+types/share-invitations-create";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Share Invitation" },
    { name: "description", content: "Create a new share invitation" },
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
              Invalid URL. Please go back and try again.
            </p>
          </div>
          <Link to="/">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CreateShareInvitation({
  params,
}: Route.ComponentProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");

  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const { post } = apiResourceActions<{ title: string }>(decodedUrl, user!);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await post({ title });
      showSuccessToast("Invitation created successfully");
      navigate(-1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create invitation";
      showErrorToast(message);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create Share Invitation
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
