import { redirect, useSubmit } from "react-router";
import { useTranslation } from "react-i18next";
import type { Link as RestspecLink } from "@kewne/restspec";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { createApiClient, type Checklist } from "~/lib/api";
import { getUser } from "~/lib/auth";
import i18n from "~/lib/i18n";
import { useLocaleNavigate } from "~/lib/locale";
import type { CreateChecklistRequest } from "~/lib/restspec-api";
import { showErrorToast, showSuccessToast } from "~/lib/toastHelpers";
import { ChecklistForm } from "../../components/ChecklistForm";
import { decodeApiUrl } from "../../lib/encoding";
import { type RouteHandle } from "../../lib/routeHandle";
import type { Route } from "./+types/create";

export const handle: RouteHandle = {
  heading: { labelKey: "checklist.createTitle" },
};

export function meta({ }: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.checklistCreate.title") },
    { name: "description", content: i18n.t("meta.checklistCreate.description") },
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

export async function clientAction({ params, request }: Route.ClientActionArgs) {
  const user = await getUser();
  const link: RestspecLink<{ post: [CreateChecklistRequest, unknown] }> = {
    href: decodeApiUrl(params.apiUrlEncoded),
  };
  const data = (await request.json()) as CreateChecklistRequest;
  try {
    const client = await createApiClient(user);
    await client.post(link, data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : i18n.t("toast.createChecklistFailed");
    showErrorToast(message);
    return;
  }
  showSuccessToast(i18n.t("toast.checklistCreated"));
  return redirect(`/${params.locale}/checklists/list/${params.apiUrlEncoded}`);
}

export default function CreateChecklist({ params }: Route.ComponentProps) {
  const navigate = useLocaleNavigate();
  const submit = useSubmit();
  const { t } = useTranslation();

  const handleSubmit = async (data: Checklist) => {
    await submit(data, { method: "post", encType: "application/json" });
  };

  return (
    <>
      <ChecklistForm
        submitLabel={t("common.create")}
        onSubmit={handleSubmit}
        onCancel={async () => navigate(`/checklists/list/${params.apiUrlEncoded}`)}
      />
    </>
  );
}
