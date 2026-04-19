import { NavLink } from "react-router";
import type { Route } from "./+types/checklist";
import { useAuth } from "../lib/auth";
import { useResource } from "../lib/useResource";
import { decodeApiUrl } from "../lib/encoding";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Checklist Detail" },
    { name: "description", content: "View checklist details" },
  ];
}

export default function ChecklistDetail({
  params,
}: Route.ComponentProps) {
  const { user, loading: authLoading } = useAuth();

  // Decode the API URL from the route parameter
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Please sign in to view this checklist.</div>
      </div>
    );
  }

  const { state } = useResource(decodedUrl, user);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <NavLink
            to="/"
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            ← Back to Checklists
          </NavLink>
        </div>

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
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {(state.resource.properties.title as string) || "Untitled Checklist"}
              </h1>

              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>

                <div className="space-y-2">
                  {(() => {
                    const items = (state.resource.properties.items as Array<{ title?: string; description?: string }>) ?? [];
                    return items.length === 0 ? (
                      <p className="text-gray-500 text-sm">No items in this checklist yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {items.map((item, index) => (
                          <li
                            key={index}
                            className="px-4 py-3 bg-gray-50 rounded-md border border-gray-200"
                          >
                            <p className="text-gray-800 font-medium">{item.title || "Unnamed item"}</p>
                            {item.description && (
                              <p className="text-gray-500 text-sm mt-0.5">{item.description}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
