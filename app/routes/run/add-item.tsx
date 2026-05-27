import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "~/components/Link";
import { TextInput } from "~/components/TextInput";
import { apiResourceActions } from "~/lib/api";
import { Button } from "../../components/Button";
import { useAuth } from "../../lib/auth";
import { decodeApiUrl } from "../../lib/encoding";
import type { Route } from "./+types/add-item";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Add Item" },
    { name: "description", content: "Add an item to a checklist run" },
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

export default function AddItem({ params }: Route.ComponentProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const { post } = apiResourceActions<{ title: string; description?: string }>(
    decodedUrl,
    user!,
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await post({ title, description: description || undefined });
    navigate(-1);
  };

  const handleCancel = async () => {
    navigate(-1);
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <TextInput
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
            <span className="text-gray-400 font-normal"> (optional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button action={handleCancel}>
            Cancel
          </Button>
          <Button
            action="submit"
            type="primary"
          >
            Add Item
          </Button>
        </div>
      </form>
    </>
  );
}
