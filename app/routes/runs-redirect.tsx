import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/runs-redirect";
import { useAuth } from "../lib/auth";
import { useResource } from "~/lib/useResource";
import { encodeApiUrl } from "~/lib/encoding";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Runs" },
    { name: "description", content: "Redirecting to runs..." },
  ];
}

export default function RunsRedirect({ params }: Route.ComponentProps) {
  const { user } = useAuth();
  const { state } = useResource('https://api.checklists.keeoon.dev/', user!);
  const navigate = useNavigate();

  useEffect(() => {
    if (state.status === 'success') {
      const instancesLink = state.resource.getNamedLink('related', 'checklist-instances');
      if (instancesLink) {
        navigate(`/runs/instances/${encodeApiUrl(instancesLink.href)}`, { replace: true });
      }
    }
  }, [state, navigate]);

  if (state.status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-red-600 mb-4">
              <p className="font-semibold">Error</p>
              <p className="text-sm">Failed to load runs. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
            <span className="text-gray-600">Loading runs...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
