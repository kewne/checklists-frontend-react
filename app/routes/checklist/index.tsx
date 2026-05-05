import { useEffect } from "react";
import { useNavigate } from "react-router";
import { encodeApiUrl } from "~/lib/encoding";
import { useResource } from "~/lib/useResource";
import { useAuth } from "../../lib/auth";
import type { Route } from "./+types/index";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Checklists" },
    { name: "description", content: "Redirecting to checklists..." },
  ];
}

export default function ChecklistsRedirect({ params }: Route.ComponentProps) {
  const { user } = useAuth();
  const { state } = useResource('https://api.checklists.keeoon.dev/', user!);
  const navigate = useNavigate();

  useEffect(() => {
    if (state.status === 'success') {
      const checklistsLink = state.resource.getNamedLink('related', 'checklists');
      if (checklistsLink) {
        navigate(`/checklists/list/${encodeApiUrl(checklistsLink.href)}`, { replace: true });
      }
    }
  }, [state, navigate]);

  if (state.status === 'error') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700 font-semibold">Failed to load checklists</p>
          <p className="text-red-600 text-sm mt-1">{state.error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
    </div>
  );
}
