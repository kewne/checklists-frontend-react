import { NavLink, useSubmit } from "react-router";
import { useTranslation } from "react-i18next";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import {
  getApiResource,
  createApiClient,
  type Checklist,
} from "~/lib/api";
import type { Link as RestspecLink } from "@kewne/restspec";
import type {
  Checklist as ChecklistResource,
  ReplaceChecklistRequest,
} from "~/lib/restspec-api";
import { getUser } from "~/lib/auth";
import i18n from "~/lib/i18n";
import { localePath, useLocale } from "~/lib/locale";
import { showErrorToast, showSuccessToast } from "~/lib/toastHelpers";
import { ChecklistForm } from "../../components/ChecklistForm";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import { type RouteHandle } from "../../lib/routeHandle";
import type { Route } from "./+types/edit";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.checklistEdit.title") },
    { name: "description", content: i18n.t("meta.checklistEdit.description") },
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
  const checklistResource = await getApiResource<ChecklistResource>(
    decodedUrl,
    user,
  );
  return { checklistResource, decodedUrl };
}

export async function clientAction({ params, request }: Route.ClientActionArgs) {
  const user = await getUser();
  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const data = (await request.json()) as Checklist;
  try {
    const link: RestspecLink<{
      put: [ReplaceChecklistRequest, ChecklistResource];
    }> = { href: decodedUrl };
    const client = await createApiClient(user);
    await client.put(link, data);
    showSuccessToast(i18n.t("toast.checklistSaved"));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : i18n.t("toast.updateChecklistFailed");
    showErrorToast(message);
  }
}

export const handle: RouteHandle<{ decodedUrl: string }> = {
  up: ({ decodedUrl }) => ({
    labelKey: "up.checklist",
    to: `/checklists/show/${encodeApiUrl(decodedUrl)}`,
  }),
};

export default function ChecklistEdit({ loaderData }: Route.ComponentProps) {
  const submit = useSubmit();
  const { t } = useTranslation();

  const { checklistResource } = loaderData;

  const sharesLink = checklistResource.getNamedLink(
    "related",
    "shares",
  );

  const handleSubmit = async (data: Checklist) => {
    await submit(data, { method: "post", encType: "application/json" });
  };

  return (
    <div>
      <div className="flex items-start justify-end gap-x-2 mb-4">
        <div className="space-x-2">
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
      <ChecklistForm
        initialValues={checklistResource.properties}
        submitLabel={t("common.save")}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
