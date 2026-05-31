import { Heading } from "~/components/Heading";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { apiResourceActions } from "../../lib/api";
import { getUser } from "../../lib/auth";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import type { Route } from "./+types/share-invitations-show";

type ShareInvitation = {
  title: string;
  checklistTitle: string;
  createdAt: string;
  expiresAt: string;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Share Invitation" },
    { name: "description", content: "View share invitation" },
  ];
}

export function ErrorBoundary({}: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Panel>
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">
              Invalid URL. Please go back and try again.
            </p>
          </div>
          <Link to="/">Back to Home</Link>
        </Panel>
      </div>
    </div>
  );
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const user = await getUser();
  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const invitationResource = await apiResourceActions<ShareInvitation>(
    decodedUrl,
    user,
  ).get();
  return { invitationResource };
}

export default function ShareInvitationShow({
  loaderData,
}: Route.ComponentProps) {
  const { invitationResource } = loaderData;
  const { title, checklistTitle, createdAt, expiresAt } =
    invitationResource.properties;
  const previewLink = invitationResource.getFirstLinkMatching("preview");
  const shareUrl = previewLink
    ? `${window.location.origin}/checklists/share-invitations/accept/${encodeApiUrl(previewLink.href)}`
    : undefined;

  return (
    <>
      <Heading level="1">{title}</Heading>
      <Panel>
        <p className="text-sm text-gray-600">Checklist: {checklistTitle}</p>
        <p className="text-sm text-gray-600">
          Created at {new Date(createdAt).toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          Expires at {new Date(expiresAt).toLocaleString()}
        </p>
        {previewLink && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-1">
              Share this link to invite someone:
            </p>
            <pre className="bg-gray-100 border border-gray-200 px-4 py-3 text-gray-600 text-sm break-all whitespace-pre-wrap">
              {shareUrl}
            </pre>
          </div>
        )}
      </Panel>
    </>
  );
}
