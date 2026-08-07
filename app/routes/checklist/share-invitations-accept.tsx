import { Form, redirect } from "react-router";
import { Button } from "~/components/Button";
import { Heading } from "~/components/Heading";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { apiResourceActions } from "~/lib/api";
import { getUser } from "../../lib/auth";
import { decodeApiUrl } from "../../lib/encoding";
import { showErrorToast, showSuccessToast } from "../../lib/toastHelpers";
import type { Route } from "./+types/share-invitations-accept";

type ShareInvitation = {
  checklistTitle: string;
  expiresAt: string;
};

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Accept Share Invitation" },
    { name: "description", content: "Accept a share invitation" },
  ];
}

export function ErrorBoundary({ }: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Panel>
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">Invalid URL. Please go back and try again.</p>
          </div>
          <Link to="/">Back to Home</Link>
        </Panel>
      </div>
    </div>
  );
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const user = await getUser();
  const formData = await request.formData();

  if (request.method === "DELETE") {
    const href = formData.get("href");
    if (typeof href !== "string") {
      throw new Response("Invalid href", { status: 400 });
    }
    try {
      await apiResourceActions(href, user).delete();
      showSuccessToast("Invitation dismissed");
      return redirect("/checklists");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to dismiss invitation";
      showErrorToast(message);
    }
    return;
  }

  if (request.method !== "POST") {
    throw new Response("Method not allowed", { status: 405 });
  }

  const acceptLinkHref = formData.get("acceptLinkHref");

  if (typeof acceptLinkHref !== "string") {
    throw new Response("Invalid accept link", { status: 400 });
  }

  try {
    const { post } = apiResourceActions(acceptLinkHref, user);
    await post(undefined);
    showSuccessToast("Invitation accepted successfully");
    return redirect("/checklists");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to accept invitation";
    showErrorToast(message);
  }
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const user = await getUser();
  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const invitationResource = await apiResourceActions<ShareInvitation>(decodedUrl, user).get();
  return { invitationResource, invitationUrl: decodedUrl };
}

export default function ShareInvitationAccept({ loaderData }: Route.ComponentProps) {
  const { invitationResource, invitationUrl } = loaderData;

  const { checklistTitle: title, expiresAt } = invitationResource.properties;
  const acceptLink = invitationResource.getFirstLinkMatching("accept");

  const isExpired = !acceptLink && new Date(expiresAt) < new Date();
  const explanation = !acceptLink
    ? isExpired
      ? "This invitation has expired."
      : "You already have access to this checklist."
    : undefined;

  return (
    <>
      <p className="text-gray-600 mb-4">Someone shared the following checklist with you:</p>
      <Heading level="1">{title}</Heading>
      {explanation && <p className="text-gray-600 mb-4">{explanation}</p>}
      {acceptLink ? (
        <Form method="POST">
          <input type="hidden" name="acceptLinkHref" value={acceptLink.href} />
          <Button type="primary" size="large" action="submit">
            Accept
          </Button>
        </Form>
      ) : (
        <Form method="DELETE">
          <input type="hidden" name="href" value={invitationUrl} />
          <Button type="secondary" size="large" action="submit">
            Dismiss
          </Button>
        </Form>
      )}
    </>
  );
}
