import { useNavigate, useRevalidator } from "react-router";
import { Link } from "~/components/Link";
import { ChecklistRunDetail } from "../../components/ChecklistRunDetail";
import { apiResourceActions } from "../../lib/api";
import { getUser } from "../../lib/auth";
import { decodeApiUrl } from "../../lib/encoding";
import type { Route } from "./+types/show";
import type { ChecklistRun } from "~/lib/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Checklist Run" },
    { name: "description", content: "View checklist run details" },
  ];
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{String(error)}</p>
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
  const runResource = await apiResourceActions<ChecklistRun>(decodedUrl, user).get();
  return { runResource, user, decodedUrl };
}

export default function ChecklistRun({ loaderData, params }: Route.ComponentProps) {
  const { runResource, user, decodedUrl } = loaderData;
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();

  const doDelete = async () => {
    await apiResourceActions(decodedUrl, user).delete();
    navigate("/");
  };

  return (
    <ChecklistRunDetail
      resource={runResource}
      user={user}
      onItemUpdated={revalidate}
      onDelete={doDelete}
      onEdit={async () => navigate(`/runs/edit/${params.apiUrlEncoded}`)}
    />
  );
}
