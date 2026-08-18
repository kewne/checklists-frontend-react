import { Form, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { Heading } from "~/components/Heading";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { apiResourceActions } from "~/lib/api";
import { getUser } from "../../lib/auth";
import { decodeApiUrl } from "../../lib/encoding";
import i18n from "~/lib/i18n";
import { showErrorToast, showSuccessToast } from "../../lib/toastHelpers";
import type { Route } from "./+types/share-invitations-accept";

type ShareInvitation = {
  checklistTitle: string;
  expiresAt: string;
};

export function meta({ }: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.shareInvitationAccept.title") },
    { name: "description", content: i18n.t("meta.shareInvitationAccept.description") },
  ];
}

export function ErrorBoundary({ }: Route.ErrorBoundaryProps) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Panel>
          <div className="text-red-600 mb-4">
            <p className="font-semibold">{t("error.title")}</p>
            <p className="text-sm">{t("error.invalidUrl")}</p>
          </div>
          <Link to="/">{t("common.backToHome")}</Link>
        </Panel>
      </div>
    </div>
  );
}

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const user = await getUser();
  const formData = await request.formData();

  if (request.method === "DELETE") {
    const href = formData.get("href");
    if (typeof href !== "string") {
      throw new Response("Invalid href", { status: 400 });
    }
    try {
      await apiResourceActions(href, user).delete();
      showSuccessToast(i18n.t("toast.invitationDismissed"));
      return redirect(`/${params.locale}/checklists`);
    } catch (error) {
      const message = error instanceof Error ? error.message : i18n.t("toast.dismissInvitationFailed");
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
    showSuccessToast(i18n.t("toast.invitationAccepted"));
    return redirect(`/${params.locale}/checklists`);
  } catch (error) {
    const message = error instanceof Error ? error.message : i18n.t("toast.acceptInvitationFailed");
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
  const { t } = useTranslation();

  const { checklistTitle: title, expiresAt } = invitationResource.properties;
  const acceptLink = invitationResource.getFirstLinkMatching("accept");

  const isExpired = !acceptLink && new Date(expiresAt) < new Date();
  const explanation = !acceptLink
    ? isExpired
      ? t("share.expired")
      : t("share.alreadyHaveAccess")
    : undefined;

  return (
    <>
      <p className="text-gray-600 mb-4">{t("share.sharedWithYou")}</p>
      <Heading level="1">{title}</Heading>
      {explanation && <p className="text-gray-600 mb-4">{explanation}</p>}
      {acceptLink ? (
        <Form method="POST">
          <input type="hidden" name="acceptLinkHref" value={acceptLink.href} />
          <Button type="primary" size="large" action="submit">
            {t("common.accept")}
          </Button>
        </Form>
      ) : (
        <Form method="DELETE">
          <input type="hidden" name="href" value={invitationUrl} />
          <Button type="secondary" size="large" action="submit">
            {t("common.dismiss")}
          </Button>
        </Form>
      )}
    </>
  );
}
