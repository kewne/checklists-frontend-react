import { redirect } from "react-router";
import type { Route } from "./+types/home";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { apiResourceActions } from "~/lib/api";
import { getUser } from "../lib/auth";
import { encodeApiUrl } from "~/lib/encoding";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Checklists" },
    { name: "description", content: "Manage your checklists" },
  ];
}

export function ErrorBoundary({}: Route.ErrorBoundaryProps) {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Panel>
        <div className="text-red-600 mb-4">
          <p className="font-semibold">API connection failed</p>
          <p className="text-sm">Could not connect to the API. Please try again later.</p>
        </div>
        <Link to="/">Retry</Link>
      </Panel>
    </div>
  );
}

export async function clientLoader() {
  const user = await getUser();
  const rootResource = await apiResourceActions("https://api.checklists.keeoon.dev/", user).get();
  const instancesLink = rootResource.getFirstLinkMatching("related", (link) => link.name === "checklist-instances");
  if (instancesLink) {
    return redirect(`/runs/list/${encodeApiUrl(instancesLink.href)}`);
  }
  return {};
}

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 flex items-center justify-center">
      <div className="animate-spin h-6 w-6 border-b-2 border-indigo-600"></div>
    </div>
  );
}
