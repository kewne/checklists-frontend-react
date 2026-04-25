import { NavLink } from "react-router";
import type { Route } from "./+types/checklists-show";
import { useAuth } from "../lib/auth";
import { useResource } from "../lib/useResource";
import { decodeApiUrl } from "../lib/encoding";
import { ChecklistForm } from "../components/ChecklistForm";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Checklist Detail" },
    { name: "description", content: "View checklist details" },
  ];
}

export function ErrorBoundary({}: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">Invalid checklist URL. Please go back and try again.</p>
          </div>
          <NavLink
            to="/"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700"
          >
            Back to Checklists
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default function ChecklistDetail({
  params,
}: Route.ComponentProps) {
  const { user } = useAuth();

  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);

  const { state, put } = useResource(decodedUrl, user!);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow p-6">
        {state.status === "loading" && (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
            <span className="text-gray-600">Loading checklist...</span>
          </div>
        )}

        {state.status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-semibold">Failed to load checklist</p>
            <p className="text-red-600 text-sm mt-1">{state.error.message}</p>
          </div>
        )}

        {state.status === "success" && (
          <ChecklistForm
            initialValues={{
              title: (state.resource.properties.title as string) ?? '',
              items: ((state.resource.properties.items as Array<{ title?: string; description?: string }>) ?? []).map(
                (item) => ({ title: item.title ?? '', description: item.description ?? '' })
              ),
            }}
            submitLabel="Save"
            onSubmit={put}
          />
        )}
      </div>
    </div>
  );
}
