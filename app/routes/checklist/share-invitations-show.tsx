import { useAuth } from "../../lib/auth";
import { decodeApiUrl } from "../../lib/encoding";
import { useResource } from "../../lib/useResource";
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

export default function ShareInvitationShow({ params }: Route.ComponentProps) {
  const { user } = useAuth();
  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const { state } = useResource<ShareInvitation>(decodedUrl, user!);

  if (state.status === "loading") {
    return (
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
        <span className="text-gray-600">Loading...</span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700 font-semibold">Failed to load invitation</p>
        <p className="text-red-600 text-sm mt-1">{state.error.message}</p>
      </div>
    );
  }

  const { title, checklistTitle, createdAt, expiresAt } = state.resource.properties;
  const previewLink = state.resource.getFirstLinkMatching("preview");
  const shareUrl = previewLink
    ? `${window.location.origin}/checklists/share-invitations/accept/${params.apiUrlEncoded}`
    : undefined;

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
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
          <pre className="bg-gray-100 border border-gray-200 rounded-md px-4 py-3 text-gray-600 text-sm break-all whitespace-pre-wrap">
              {shareUrl}
          </pre>
        </div>
      )}
    </>
  );
}
