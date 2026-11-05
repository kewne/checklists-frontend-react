import { NavLink, redirect, useSubmit } from "react-router";
import { useTranslation } from "react-i18next";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { createApiClient, getApiResource } from "~/lib/api";
import type { Checklist } from "~/lib/restspec-api";
import { getUser } from "~/lib/auth";
import i18n from "~/lib/i18n";
import { localePath, useLocale } from "~/lib/locale";
import { showErrorToast } from "~/lib/toastHelpers";
import { Button } from "../../components/Button";
import { HexCheckbox } from "../../components/HexCheckbox";
import { List } from "../../components/List";
import { QrCode } from "../../components/QrCode";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import { renderWithLinks } from "../../lib/renderWithLinks";
import { resourceHeading, type RouteHandle } from "../../lib/routeHandle";
import type { Route } from "./+types/show";

export const handle: RouteHandle<{
  checklistResource: Checklist;
}> = {
  heading: ({ checklistResource }) => ({
    labelKey: "checklist.showTitle",
    values: {
      title: resourceHeading(checklistResource, "title") ?? "",
    },
  }),
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.checklistShow.title") },
    { name: "description", content: i18n.t("meta.checklistShow.description") },
  ];
}

export function ErrorBoundary({}: Route.ErrorBoundaryProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Panel>
          <div className="text-red-600 mb-4">
            <p className="font-semibold">{t("error.title")}</p>
            <p className="text-sm">
              {t("error.invalidChecklistUrl")}
            </p>
          </div>
          <NavLink
            to={localePath("/", locale)}
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700"
          >
            {t("common.backToChecklists")}
          </NavLink>
        </Panel>
      </div>
    </div>
  );
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const user = await getUser();
  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const checklistResource = await getApiResource<Checklist>(
    decodedUrl,
    user,
  );
  return { checklistResource, decodedUrl };
}

export async function clientAction({ params }: Route.ClientActionArgs) {
  const user = await getUser();
  const checklistResource = await getApiResource<Checklist>(
    decodeApiUrl(params.apiUrlEncoded),
    user,
  );
  const link = checklistResource.getNamedLink("create-from", "instance");
  if (!link) {
    showErrorToast(i18n.t("toast.createRunFailed"));
    return;
  }
  let location: string | undefined;
  try {
    const client = await createApiClient(user);
    const created = await client.post(link, {
      title: checklistResource.properties.title,
    });
    location = created.location?.href;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : i18n.t("toast.createRunFailed");
    showErrorToast(message);
    return;
  }
  if (!location) {
    return redirect(`/${params.locale}/runs`);
  }
  return redirect(`/${params.locale}/runs/show/${encodeApiUrl(location)}`);
}

function findItemUrls(description: string | undefined): string[] {
  if (!description) return [];
  return description.split(/(\s+)/).filter((token) => {
    const url = URL.parse(token);
    return url?.protocol === "https:" || url?.protocol === "mailto:";
  });
}

function urlLabel(token: string): string {
  const url = URL.parse(token);
  if (url?.protocol === "mailto:") {
    return url.pathname;
  }
  return url?.hostname ?? token;
}

export default function ChecklistShow({ loaderData }: Route.ComponentProps) {
  const submit = useSubmit();
  const { t } = useTranslation();

  const { checklistResource, decodedUrl } = loaderData;
  const { items } = checklistResource.properties;

  const createInstanceLink = checklistResource.getNamedLink(
    "create-from",
    "instance",
  );

  const sharesLink = checklistResource.getNamedLink(
    "related",
    "shares",
  );

  return (
    <div className="-mt-4">
      <div className="flex items-start justify-between gap-x-2 mb-4 print:hidden">
        <div>
          {createInstanceLink ? (
            <Button
              type="primary"
              size="large"
              action={async () => {
                await submit(null, { method: "post" });
              }}
            >
              {t("checklist.run")}
            </Button>
          ) : null}
        </div>
        <div className="space-x-2">
          <Link
            variant="inline-block"
            size="large"
            to={`/checklists/edit/${encodeApiUrl(decodedUrl)}`}
          >
            {t("common.edit")}
          </Link>
          {sharesLink && (
            <Link
              variant="inline-block"
              size="large"
              to={`/checklists/shares/list/${encodeApiUrl(sharesLink.href)}`}
            >
              {t("checklist.shares")}
            </Link>
          )}
        </div>
      </div>
      <List
        ariaLabel="checklist items"
        items={items.map((item) => {
          const itemUrls = findItemUrls(item.description);
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 print:break-inside-avoid w-full"
            >
              <HexCheckbox className="hidden h-5 w-5 shrink-0 print:block" />
              <div className="grow">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap dark:text-gray-400">
                    {renderWithLinks(item.description)}
                  </p>
                )}
              </div>
              <div>
              {itemUrls.map((itemUrl) => (
                <div
                  key={itemUrl}
                  className="hidden shrink-0 text-center print:block"
                >
                  <QrCode value={itemUrl} className="h-24 w-24" />
                  <p className="text-[10px] text-gray-600">
                    {urlLabel(itemUrl)}
                  </p>
                </div>
              ))}
              </div>
            </div>
          );
        })}
      />
      <div className="hidden mt-8 text-center print:block print:break-inside-avoid">
        <QrCode value={window.location.origin} className="mx-auto h-24 w-24" />
        <p className="text-[10px] text-gray-600">
          Get the app: {urlLabel(window.location.origin)}
        </p>
      </div>
    </div>
  );
}
