import { Link as RouterLink, NavLink } from "react-router";
import { Link } from "~/components/Link";
import { useAuth } from "../../lib/auth";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import { useResource } from "../../lib/useResource";
import type { Route } from "./+types/share-invitations";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Share Invitations" },
    { name: "description", content: "Manage share invitations" },
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
          <Link to="/">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ShareInvitations({ params }: Route.ComponentProps) {
  const { user } = useAuth();

  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const { state } = useResource(decodedUrl, user!);

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

  const items = state.resource.getLinkArray("items");
  const createLink = state.resource.getFirstLinkMatching("create");

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Share Invitations
      </h1>
      {createLink && (
        <Link to={`/checklists/share-invitations/create/${encodeApiUrl(createLink.href)}`}>
          Create...
        </Link>
      )}
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No invitations found.</p>
      ) : (
        <ul
          aria-label="share invitations"
          className="mt-4 divide-y divide-gray-100 border border-gray-200 rounded-md"
        >
          {items.map((item) => (
            <li key={item.href}>
              <RouterLink
                to={`/checklists/share-invitations/show/${encodeApiUrl(item.href)}`}
                className="block px-4 py-3 text-sm text-gray-800 font-medium hover:bg-gray-50"
              >
                {item.title ?? item.name ?? item.href}
              </RouterLink>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
