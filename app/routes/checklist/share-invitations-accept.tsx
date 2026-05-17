import { useNavigate } from "react-router";
import { useAuth } from "../../lib/auth";
import { decodeApiUrl } from "../../lib/encoding";
import { useResource } from "../../lib/useResource";
import { apiResourceActions } from "~/lib/api";
import { Button } from "~/components/Button";
import type { Route } from "./+types/share-invitations-accept";

type ShareInvitation = {
  checklistTitle: string;
  expiresAt: string;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Accept Share Invitation" },
    { name: "description", content: "Accept a share invitation" },
  ];
}

export default function ShareInvitationAccept({ params }: Route.ComponentProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const { checklistTitle: title } = state.resource.properties;
  const acceptLink = state.resource.getFirstLinkMatching("accept");

  const handleAccept = async () => {
    const { post } = apiResourceActions(acceptLink!.href, user!);
    await post(undefined);
    navigate("/checklists");
  };

  return (
    <>
      <p className="text-gray-600 mb-4">Someone shared the following checklist with you:</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
      {acceptLink && (
        <Button type="success" size="large" action={handleAccept}>
          Accept
        </Button>
      )}
    </>
  );
}
