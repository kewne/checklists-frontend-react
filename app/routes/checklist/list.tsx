import { Link } from "~/components/Link";
import { ChecklistList } from "~/components/ChecklistList";
import { apiResourceActions } from "~/lib/api";
import { getUser } from "~/lib/auth";
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
          <Link to="/">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const user = await getUser();
  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const checklistsResource = await apiResourceActions(decodedUrl, user).get();
  return { checklistsResource, user };
}

export default function List({ loaderData, params }: Route.ComponentProps) {
  const { checklistsResource, user } = loaderData;

  return (
    <div>
      <Link variant="inline-block" size="large" to={`/checklists/create/${params.apiUrlEncoded}`}>
        Create Checklist
      </Link>
      <ChecklistList resource={checklistsResource} user={user} />
    </div>
  );
}
