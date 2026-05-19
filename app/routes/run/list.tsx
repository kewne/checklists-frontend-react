import { useRevalidator } from "react-router";
import { Link } from "~/components/Link";
import { ChecklistInstanceList } from "../../components/ChecklistInstanceList";
import { apiResourceActions } from "../../lib/api";
import { getUser } from "../../lib/auth";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import type { Route } from "./+types/list";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Checklist Runs" },
    { name: "description", content: "View checklist runs" },
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
          <Link to="/">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const user = await getUser();
  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const runsResource = await apiResourceActions(decodedUrl, user).get();
  return { runsResource };
}

export default function ChecklistInstances({
  loaderData,
}: Route.ComponentProps) {
  const { runsResource } = loaderData;
  const { revalidate } = useRevalidator();

  const items = runsResource.getLinkArray("items");
  const createLink = runsResource.getFirstLinkMatching("create");

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Checklist Runs</h1>
      {createLink && (
        <Link
          variant="inline-block"
          size="large"
          to={`/runs/create/${encodeApiUrl(createLink.href)}`}
        >
          Create run
        </Link>
      )}
      <ChecklistInstanceList items={items} onRefresh={revalidate} />
    </>
  );
}
