import { useTranslation } from "react-i18next";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import type { ChecklistRun, WriteableChecklistRun } from "~/lib/api";
import { RunEditForm } from "../../components/RunEditForm";
import { apiResourceActions } from "../../lib/api";
import { getUser } from "../../lib/auth";
import { decodeApiUrl } from "../../lib/encoding";
import i18n from "~/lib/i18n";
import { useLocaleNavigate } from "~/lib/locale";
import { showErrorToast } from "../../lib/toastHelpers";
import type { Route } from "./+types/edit";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.runEdit.title") },
    { name: "description", content: i18n.t("meta.runEdit.description") },
  ];
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Panel>
          <div className="text-red-600 mb-4">
            <p className="font-semibold">{t("error.title")}</p>
            <p className="text-sm">{String(error)}</p>
          </div>
          <Link to="/">
            {t("common.backToHome")}
          </Link>
        </Panel>
      </div>
    </div>
  );
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const user = await getUser();
  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const runResource = await apiResourceActions<ChecklistRun>(decodedUrl, user).get();
  return { runResource, user, decodedUrl };
}

export default function EditRun({ loaderData, params }: Route.ComponentProps) {
  const { runResource, user, decodedUrl } = loaderData;
  const navigate = useLocaleNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (data: WriteableChecklistRun) => {
    try {
      await apiResourceActions<ChecklistRun, WriteableChecklistRun>(decodedUrl, user).put(data);
      navigate(`/runs/show/${params.apiUrlEncoded}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("toast.updateRunFailed");
      showErrorToast(message);
    }
  };

  const handleCancel = () => {
    navigate(`/runs/show/${params.apiUrlEncoded}`);
  };

  return (
    <RunEditForm
      initialValues={runResource.properties}
      submitLabel={t("common.save")}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
