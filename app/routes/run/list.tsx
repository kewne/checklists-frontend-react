import { Link } from "~/components/Link";
import { ChecklistInstanceList } from "../../components/ChecklistInstanceList";
import { useAuth } from "../../lib/auth";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import { useResource } from "../../lib/useResource";
import type { Route } from "./+types/list";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Checklist Runs" },
    { name: "description", content: "View checklist runs" },
  ];
}

export function ErrorBoundary({ }: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">Invalid URL. Please go back and try again.</p>
          </div>
          <Link to="/">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ChecklistInstances({ params }: Route.ComponentProps) {
  const { user } = useAuth();

  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const { state, get } = useResource(decodedUrl, user!);

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Checklist Runs</h1>
          <div className="animate-pulse text-gray-500 text-sm">Loading checklist instances...</div>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Checklist Runs</h1>
          <div className="mt-4 text-red-600 text-sm">Failed to load checklist instances: {state.error.message}</div>
        </div>
      </div>
    );
  }

  const items = state.resource.getLinkArray('items');
  const createLink = state.resource.getLink('create');
  const createHref = Array.isArray(createLink) ? createLink[0]?.href : createLink?.href;

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Checklist Runs</h1>
      {createHref && (
        <Link to={`/runs/create/${encodeApiUrl(createHref)}`}>
          Create run
        </Link>
      )}
      <ChecklistInstanceList items={items} user={user!} onRefresh={get} />
    </>
  );
}
