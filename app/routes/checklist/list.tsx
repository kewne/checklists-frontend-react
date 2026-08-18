import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Await, useFetcher } from "react-router";
import { Button } from "~/components/Button";
import { Heading } from "~/components/Heading";
import { Link } from "~/components/Link";
import { List } from "~/components/List";
import { Loading } from "~/components/Loading";
import { Panel } from "~/components/Panel";
import { ApiResource, apiResourceActions } from "~/lib/api";
import { getUser } from "~/lib/auth";
import { decodeApiUrl, encodeApiUrl } from "~/lib/encoding";
import i18n from "~/lib/i18n";
import { showErrorToast, showSuccessToast } from "../../lib/toastHelpers";
import type { Route } from "./+types/list";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.checklistList.title") },
    { name: "description", content: i18n.t("meta.checklistList.description") },
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
              {t("error.invalidChecklistsUrl")}
            </p>
          </div>
          <Link to="/">
            {t("common.backToHome")}
          </Link>
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
    showSuccessToast(i18n.t("toast.checklistDeleted"));
  } catch (error) {
    const message = error instanceof Error ? error.message : i18n.t("toast.deleteChecklistFailed");
    showErrorToast(message);
  }
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const user = await getUser();
  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const checklistsResource = await apiResourceActions(decodedUrl, user).get();
  const sharedLink = checklistsResource.getFirstLinkMatching("related", (link) => link.name === "shared");
  return {
    checklistsResource,
    sharedChecklistsPromise: sharedLink
      ? apiResourceActions(sharedLink.href, user).get()
      : null,
    user,
  };
}

function SharedChecklistsList({ resource }: { resource: ApiResource }) {
  const { t } = useTranslation();
  const items = resource.getLinkArray("items");
  return (
    <>
      {items.length === 0 ? (
        <div className="px-4 py-3 text-gray-500 text-sm">
          {t("checklist.emptyShared")}
        </div>
      ) : (
        <List
          ariaLabel="shared checklists"
          items={items.map((item) => (
            <Link to={`/checklists/show/${encodeApiUrl(item.href)}`}>
              {item.title ?? item.name}
            </Link>
          ))}
        />
      )}
    </>
  );
}

export default function ChecklistList({ loaderData, params }: Route.ComponentProps) {
  const { checklistsResource, sharedChecklistsPromise } = loaderData;
  const { t } = useTranslation();
  const fetcher = useFetcher();
  const items = checklistsResource.getLinkArray("items");

  const handleDelete = (href: string) => async () => {
    const formData = new FormData();
    formData.append("href", href);
    fetcher.submit(formData, { method: "delete" });
  };

  return (
    <div>
      <Link variant="inline-block" size="large" to={`/checklists/create/${params.apiUrlEncoded}`}>
        {t("checklist.create")}
      </Link>
      {items.length === 0 ? (
        <div className="px-4 py-3 text-gray-500 text-sm">
          {t("checklist.empty")}
        </div>
      ) : (
        <List
          ariaLabel="checklists"
          items={items.map((item) => (
            <>
              <Link to={`/checklists/show/${encodeApiUrl(item.href)}`}>
                {item.title ?? item.name}
              </Link>
              <Button variant="danger" action={handleDelete(item.href)}>
                {t("common.delete")}
              </Button>
            </>
          ))}
        />
      )}
      {sharedChecklistsPromise && (
        <>
          <Heading level="2" className="mt-8">{t("checklist.sharedWithMe")}</Heading>
          <Suspense fallback={<Loading text={t("checklist.loadingShared")} />}>
            <Await resolve={sharedChecklistsPromise}>
              {(resource) => <SharedChecklistsList resource={resource} />}
            </Await>
          </Suspense>
        </>
      )}
    </div>
  );
}
