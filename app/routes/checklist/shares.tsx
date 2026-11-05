import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Await, useFetcher } from "react-router";
import { Button } from "~/components/Button";
import { Heading } from "~/components/Heading";
import { Link } from "~/components/Link";
import { List } from "~/components/List";
import { Loading } from "~/components/Loading";
import { Panel } from "~/components/Panel";
import { getUser } from "~/lib/auth";
import i18n from "~/lib/i18n";
import { createApiClient, getApiResource, linkFromHref } from "../../lib/api";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import type { List as ShareList } from "../../lib/restspec-api";
import { showErrorToast, showSuccessToast } from "../../lib/toastHelpers";
import { resourceUpLink, type RouteHandle } from "../../lib/routeHandle";
import type { Route } from "./+types/shares";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.shares.title") },
    { name: "description", content: i18n.t("meta.shares.description") },
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
            <p className="text-sm">
              {t("error.invalidUrl")}
            </p>
          </div>
          <Link to="/">{t("common.backToHome")}</Link>
        </Panel>
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
    const client = await createApiClient(user);
    await client.delete(linkFromHref<{ delete: [void, unknown] }>(href));
    showSuccessToast(i18n.t("toast.deleted"));
  } catch (error) {
    const message = error instanceof Error ? error.message : i18n.t("toast.deleteFailed");
    showErrorToast(message);
  }
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const user = await getUser();
  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const sharesResource = await getApiResource<ShareList>(decodedUrl, user);
  const invitationsLink = sharesResource.getNamedLink("related", "invitations");

  return {
    sharesResource,
    invitationsPromise: invitationsLink
      ? getApiResource<ShareList>(invitationsLink.href, user)
      : null,
  };
}

export const handle: RouteHandle<{ sharesResource: ShareList }> = {
  up: ({ sharesResource }) =>
    resourceUpLink(sharesResource, "/checklists/show", "up.checklist"),
  heading: { labelKey: "share.title" },
};

function InvitationsList({ resource }: { resource: ShareList }) {
  const fetcher = useFetcher();
  const { t } = useTranslation();
  const createLink = resource.getRel("create")[0];
  const items = resource.getRel("items");

  const handleDeleteInvitation = (href: string) => async () => {
    const formData = new FormData();
    formData.append("href", href);
    fetcher.submit(formData, { method: "delete" });
  };

  return (
    <>
      <Heading level="2" className="mt-8">{t("share.invitations")}</Heading>
      {createLink && (
        <Link
          variant="inline-block"
          size="large"
          to={`/checklists/share-invitations/create/${encodeApiUrl(createLink.href)}`}
        >
          {t("common.create")}
        </Link>
      )}
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">{t("share.emptyInvitations")}</p>
      ) : (
        <List
          ariaLabel="invitations"
          items={items.map((item) => (
            <>
              <Link
                variant="inline"
                to={`/checklists/share-invitations/show/${encodeApiUrl(item.href)}`}
              >
                {item.title ?? t("common.untitled")}
              </Link>
              <Button
                variant="danger"
                size="small"
                action={handleDeleteInvitation(item.href)}
              >
                {t("common.delete")}
              </Button>
            </>
          ))}
        />
      )}
    </>
  );
}

export default function Shares({ loaderData }: Route.ComponentProps) {
  const { sharesResource, invitationsPromise } = loaderData;
  const { t } = useTranslation();
  const items = sharesResource.getRel("items");
  const fetcher = useFetcher();

  const handleDeleteShare = (href: string) => async () => {
    const formData = new FormData();
    formData.append("href", href);
    fetcher.submit(formData, { method: "delete" });
  };

  return (
    <>
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">{t("share.empty")}</p>
      ) : (
        <List
          ariaLabel="shares"
          items={items.map((item) => (
            <>
              <Link
                variant="inline"
                to={`/checklist/shares/${encodeApiUrl(item.href)}`}
              >
                {item.title ?? t("common.untitled")}
              </Link>
              <Button
                variant="danger"
                size="small"
                action={handleDeleteShare(item.href)}
              >
                {t("common.delete")}
              </Button>
            </>
          ))}
        />
      )}
      {invitationsPromise && (
        <Suspense fallback={<Loading text={t("share.loadingInvitations")} />}>
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
