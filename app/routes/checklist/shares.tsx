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
import { apiResourceActions } from "../../lib/api";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import type { Resource } from "../../lib/hal";
import { showErrorToast, showSuccessToast } from "../../lib/toastHelpers";
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
    const resource = apiResourceActions(href, user);
    await resource.delete();
    showSuccessToast(i18n.t("toast.deleted"));
  } catch (error) {
    const message = error instanceof Error ? error.message : i18n.t("toast.deleteFailed");
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
  const { t } = useTranslation();
  const createLink = resource.getFirstLinkMatching("create");
  const items = resource.getLinkArray("items");

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
  const items = sharesResource.getLinkArray("items");
  const fetcher = useFetcher();

  const handleDeleteShare = (href: string) => async () => {
    const formData = new FormData();
    formData.append("href", href);
    fetcher.submit(formData, { method: "delete" });
  };

  return (
    <>
      <Heading level="1">{t("share.title")}</Heading>
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
