import { Suspense } from "react";
import { Await } from "react-router";
import { Link } from "~/components/Link";
import { Loading } from "~/components/Loading";
import { apiResourceActions } from "../../lib/api";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import type { Resource } from "../../lib/hal";
import type { Route } from "./+types/shares";
import { getUser } from "~/lib/auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Shares" },
    { name: "description", content: "Manage shares" },
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
  const sharesResource = await apiResourceActions(decodedUrl, user).get();

  return {
    sharesResource,
    invitationsPromise: sharesResource.getLinked(
      "related",
      (l) => l.name === "invitations",
    ),
  };
}

function InvitationsList({ resource }: { resource: Resource }) {
  const createLink = resource.getFirstLinkMatching("create");
  const items = resource.getLinkArray("items");

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

export default function Shares({ loaderData }: Route.ComponentProps) {
  const { sharesResource, invitationsPromise } = loaderData;
  const items = sharesResource.getLinkArray("items");

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
              <Link
                variant="row"
                to={`/checklist/shares/${encodeApiUrl(item.href)}`}
              >
                {item.title ?? "Untitled"}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {invitationsPromise && (
        <Suspense fallback={<Loading text="Loading invitations..." />}>
          <Await resolve={invitationsPromise}>
            {(invitationsResource) => (
              <InvitationsList resource={invitationsResource} />
            )}
          </Await>
        </Suspense>
      )}
    </>
  );
}
