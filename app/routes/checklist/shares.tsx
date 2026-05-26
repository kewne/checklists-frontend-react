import { Suspense } from "react";
import { Await, useFetcher } from "react-router";
import { Button } from "~/components/Button";
import { Link } from "~/components/Link";
import { Loading } from "~/components/Loading";
import { getUser } from "~/lib/auth";
import { apiResourceActions } from "../../lib/api";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import type { Resource } from "../../lib/hal";
import { showErrorToast, showSuccessToast } from "../../lib/toastHelpers";
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

export async function clientAction({ request }: Route.ClientActionArgs) {
  const method = request.method.toLowerCase();

  if (method !== "delete") {
    throw new Response("Method not allowed", { status: 405 });
  }

  const user = await getUser();
  const formData = await request.formData();
  const href = formData.get("href");

  if (typeof href !== "string") {
    throw new Response("Invalid href", { status: 400 });
  }

  try {
    const resource = apiResourceActions(href, user);
    await resource.delete();
    showSuccessToast("Deleted successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete";
    showErrorToast(message);
  }
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
  const fetcher = useFetcher();
  const createLink = resource.getFirstLinkMatching("create");
  const items = resource.getLinkArray("items");

  const handleDeleteInvitation = (href: string) => async () => {
    const formData = new FormData();
    formData.append("href", href);
    fetcher.submit(formData, { method: "delete" });
  };

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
            <li key={item.href} className="flex justify-between items-center px-4 py-3 hover:bg-gray-50">
              <Link
                variant="inline"
                to={`/checklists/share-invitations/show/${encodeApiUrl(item.href)}`}
              >
                {item.title ?? "Untitled"}
              </Link>
              <Button
                type="danger"
                variant="outline"
                size="small"
                action={handleDeleteInvitation(item.href)}
              >
                Delete
              </Button>
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
  const fetcher = useFetcher();

  const handleDeleteShare = (href: string) => async () => {
    const formData = new FormData();
    formData.append("href", href);
    fetcher.submit(formData, { method: "delete" });
  };

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
            <li key={item.href} className="flex justify-between items-center px-4 py-3 hover:bg-gray-50">
              <Link
                variant="inline"
                to={`/checklist/shares/${encodeApiUrl(item.href)}`}
              >
                {item.title ?? "Untitled"}
              </Link>
              <Button
                type="danger"
                variant="outline"
                size="small"
                action={handleDeleteShare(item.href)}
              >
                Delete
              </Button>
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
