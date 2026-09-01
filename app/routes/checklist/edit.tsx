import { NavLink, useRevalidator } from "react-router";
import { useTranslation } from "react-i18next";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { apiResourceActions, type Checklist } from "~/lib/api";
import { getUser } from "~/lib/auth";
import i18n from "~/lib/i18n";
import { localePath, useLocale, useLocaleNavigate } from "~/lib/locale";
import { showErrorToast, showSuccessToast } from "~/lib/toastHelpers";
import { Button } from "../../components/Button";
import { ChecklistForm } from "../../components/ChecklistForm";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
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
  const checklistResource = await apiResourceActions<Checklist>(
    decodedUrl,
    user,
  ).get();
  return { checklistResource, user, decodedUrl };
}

export default function ChecklistEdit({ loaderData }: Route.ComponentProps) {
  const navigate = useLocaleNavigate();
  const { revalidate } = useRevalidator();
  const { t } = useTranslation();

  const { checklistResource, user, decodedUrl } = loaderData;

  const createInstanceLink = checklistResource.getFirstLinkMatching(
    "create-from",
    (link) => link.name === "instance",
  );

  const sharesLink = checklistResource.getFirstLinkMatching(
    "related",
    (link) => link.name === "shares",
  );

  const handleSubmit = async (data: Checklist) => {
    try {
      await apiResourceActions<{ title: string }>(decodedUrl, user).put(data);
      showSuccessToast(t("toast.checklistSaved"));
      revalidate();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("toast.updateChecklistFailed");
      showErrorToast(message);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-x-2 mb-4">
        <div>
          {createInstanceLink ? (
            <Button
              type="primary"
              size="large"
              action={async () => {
                const location = await createInstanceLink.actions().post({
                  title: checklistResource.properties.title,
                });
                if (!location) {
                  return navigate("/runs");
                }
                navigate(`/runs/show/${encodeApiUrl(location)}`);
              }}
            >
              {t("checklist.run")}
            </Button>
          ) : null}
        </div>
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
