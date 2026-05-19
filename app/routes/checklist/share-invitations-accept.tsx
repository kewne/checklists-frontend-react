import { useNavigate } from "react-router";
import { apiResourceActions } from "~/lib/api";
import { getUser } from "../../lib/auth";
import { decodeApiUrl } from "../../lib/encoding";
import { Button } from "~/components/Button";
import { Link } from "~/components/Link";
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

export function ErrorBoundary({}: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">Invalid URL. Please go back and try again.</p>
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
  const invitationResource = await apiResourceActions<ShareInvitation>(decodedUrl, user).get();
  return { invitationResource, user };
}

export default function ShareInvitationAccept({ loaderData }: Route.ComponentProps) {
  const { invitationResource, user } = loaderData;
  const navigate = useNavigate();

  const { checklistTitle: title } = invitationResource.properties;
  const acceptLink = invitationResource.getFirstLinkMatching("accept");

  const handleAccept = async () => {
    const { post } = apiResourceActions(acceptLink!.href, user);
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
