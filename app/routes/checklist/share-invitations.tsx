import { Link } from "~/components/Link";
import { apiResourceActions } from "~/lib/api";
import { getUser } from "../../lib/auth";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
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

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const user = await getUser();
  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const invitationsResource = await apiResourceActions(decodedUrl, user).get();
  return { invitationsResource };
}

export default function ShareInvitations({ loaderData }: Route.ComponentProps) {
  const { invitationsResource } = loaderData;

  const items = invitationsResource.getLinkArray("items");
  const createLink = invitationsResource.getFirstLinkMatching("create");

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Share Invitations
      </h1>
      {createLink && (
        <Link variant="inline-block" size="large" to={`/checklists/share-invitations/create/${encodeApiUrl(createLink.href)}`}>
          Create
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
              <Link
                variant="row"
                size="large"
                to={`/checklists/share-invitations/show/${encodeApiUrl(item.href)}`}
              >
                {item.title ?? item.name ?? item.href}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
