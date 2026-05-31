import { redirect } from "react-router";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { apiResourceActions } from "~/lib/api";
import { getUser } from "~/lib/auth";
import { encodeApiUrl } from "~/lib/encoding";
import type { Route } from "./+types/index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Checklists" },
    { name: "description", content: "Redirecting to checklists..." },
  ];
}

export function ErrorBoundary({}: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Panel>
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">Failed to load checklists. Please try again.</p>
          </div>
          <Link to="/">Back to Home</Link>
        </Panel>
      </div>
    </div>
  );
}

export async function clientLoader() {
  const user = await getUser();
  const rootResource = await apiResourceActions("https://api.checklists.keeoon.dev/", user).get();
  const checklistsLink = rootResource.getFirstLinkMatching("related", (link) => link.name === "checklists");
  if (checklistsLink) {
    return redirect(`/checklists/list/${encodeApiUrl(checklistsLink.href)}`);
  }
  return {};
}

export default function ChecklistsRedirect() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 flex items-center justify-center">
      <div className="animate-spin h-6 w-6 border-b-2 border-indigo-600"></div>
    </div>
  );
}
