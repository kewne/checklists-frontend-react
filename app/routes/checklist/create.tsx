import { useTranslation } from "react-i18next";
import { Heading } from "~/components/Heading";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { apiResourceActions } from "~/lib/api";
import i18n from "~/lib/i18n";
import { useLocaleNavigate } from "~/lib/locale";
import { showErrorToast, showSuccessToast } from "~/lib/toastHelpers";
import { ChecklistForm } from "../../components/ChecklistForm";
import { useAuth } from "../../lib/auth";
import { decodeApiUrl } from "../../lib/encoding";
import type { Route } from "./+types/create";

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

export default function CreateChecklist({ params }: Route.ComponentProps) {
  const { user } = useAuth();
  const navigate = useLocaleNavigate();
  const { t } = useTranslation();

  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);

  const { post } = apiResourceActions(decodedUrl, user!);

  const handleSubmit = async (data: {
    title: string;
    items: Array<{ title: string; description: string }>;
  }) => {
    try {
      await post(data);
      showSuccessToast(t("toast.checklistCreated"));
      navigate(`/checklists/list/${params.apiUrlEncoded}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("toast.createChecklistFailed");
      showErrorToast(message);
    }
  };

  return (
    <>
      <Heading level="1">
        {t("checklist.createTitle")}
      </Heading>
      <ChecklistForm
        submitLabel={t("common.create")}
        onSubmit={handleSubmit}
        onCancel={async () => navigate(`/checklists/list/${params.apiUrlEncoded}`)}
      />
    </>
  );
}
