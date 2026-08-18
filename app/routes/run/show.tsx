import { useRevalidator } from "react-router";
import { useTranslation } from "react-i18next";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { ChecklistRunDetail } from "../../components/ChecklistRunDetail";
import { apiResourceActions } from "../../lib/api";
import { getUser } from "../../lib/auth";
import { decodeApiUrl } from "../../lib/encoding";
import i18n from "~/lib/i18n";
import { useLocaleNavigate } from "~/lib/locale";
import type { Route } from "./+types/show";
import type { ChecklistRun } from "~/lib/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.runShow.title") },
    { name: "description", content: i18n.t("meta.runShow.description") },
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

export default function ChecklistRun({ loaderData, params }: Route.ComponentProps) {
  const { runResource, user, decodedUrl } = loaderData;
  const navigate = useLocaleNavigate();
  const { revalidate } = useRevalidator();

  const doDelete = async () => {
    await apiResourceActions(decodedUrl, user).delete();
    navigate("/");
  };

  return (
    <ChecklistRunDetail
      resource={runResource}
      onItemUpdated={revalidate}
      onDelete={doDelete}
    />
  );
}
