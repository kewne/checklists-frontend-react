import { redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { apiResourceActions } from "~/lib/api";
import { getUser } from "~/lib/auth";
import { encodeApiUrl } from "~/lib/encoding";
import i18n from "~/lib/i18n";
import type { Route } from "./+types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.runsIndex.title") },
    { name: "description", content: i18n.t("meta.runsIndex.description") },
  ];
}

export function ErrorBoundary({}: Route.ErrorBoundaryProps) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Panel>
          <div className="text-red-600 mb-4">
            <p className="font-semibold">{t("error.title")}</p>
            <p className="text-sm">{t("error.loadRunsFailed")}</p>
          </div>
          <Link to="/">{t("common.backToHome")}</Link>
        </Panel>
      </div>
    </div>
  );
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const user = await getUser();
  const rootResource = await apiResourceActions("https://api.checklists.keeoon.dev/", user).get();
  const instancesLink = rootResource.getFirstLinkMatching("related", (link) => link.name === "checklist-instances");
  if (instancesLink) {
    return redirect(`/${params.locale}/runs/list/${encodeApiUrl(instancesLink.href)}`);
  }
  return {};
}

export default function RunsRedirect() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
            <span className="text-gray-600">{t("run.loading")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
