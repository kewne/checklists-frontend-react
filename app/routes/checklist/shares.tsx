import type { User } from "firebase/auth";
import { Link } from "~/components/Link";
import { useAuth } from "../../lib/auth";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import { useResource } from "../../lib/useResource";
import type { Route } from "./+types/shares";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Shares" },
    { name: "description", content: "Manage shares" },
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
              Invalid URL. Please go back and try again.
            </p>
          </div>
          <Link to="/">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

function InvitationsList({ url, user }: { url: string; user: User }) {
  const { state } = useResource(url, user);

  if (state.status === "loading") {
    return (
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
        <span className="text-gray-600">Loading invitations...</span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700 font-semibold">Failed to load invitations</p>
        <p className="text-red-600 text-sm mt-1">{state.error.message}</p>
      </div>
    );
  }

  const createLink = state.resource.getFirstLinkMatching("create");
  const items = state.resource.getLinkArray("items");

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-4 mt-8">Invitations</h2>
      {createLink && (
        <Link
          variant="inline-block"
          size="large"
          to={`/checklists/share-invitations/create/${encodeApiUrl(createLink.href)}`}
        >
          Create
        </Link>
      )}
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No invitations found.</p>
      ) : (
        <ul
          aria-label="invitations"
          className="mt-4 divide-y divide-gray-100 border border-gray-200 rounded-md"
        >
          {items.map((item) => (
            <li key={item.href}>
              <Link
                variant="row"
                to={`/checklists/share-invitations/show/${encodeApiUrl(item.href)}`}
              >
                {item.title ?? "Untitled"}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function Shares({ params }: Route.ComponentProps) {
  const { user } = useAuth();

  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const { state } = useResource(decodedUrl, user!);

  if (state.status === "loading") {
    return (
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
        <span className="text-gray-600">Loading shares...</span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700 font-semibold">Failed to load shares</p>
        <p className="text-red-600 text-sm mt-1">{state.error.message}</p>
      </div>
    );
  }

  const items = state.resource.getLinkArray("items");
  const invitationsLink = state.resource.getFirstLinkMatching(
    "related",
    (l) => l.name === "invitations"
  );

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Shares</h1>
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No shares found.</p>
      ) : (
        <ul
          aria-label="shares"
          className="mt-4 divide-y divide-gray-100 border border-gray-200 rounded-md"
        >
          {items.map((item) => (
            <li key={item.href}>
              <Link variant="row" to={`/checklist/shares/${item.href}`}>
                {item.title ?? "Untitled"}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {invitationsLink && (
        <InvitationsList url={invitationsLink.href} user={user!} />
      )}
    </>
  );
}
