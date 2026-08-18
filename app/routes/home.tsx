import { redirect } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/home";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { apiResourceActions } from "~/lib/api";
import { getUser } from "../lib/auth";
import { encodeApiUrl } from "~/lib/encoding";
import i18n from "~/lib/i18n";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.home.title") },
    { name: "description", content: i18n.t("meta.home.description") },
  ];
}

export function ErrorBoundary({}: Route.ErrorBoundaryProps) {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Panel>
        <div className="text-red-600 mb-4">
          <p className="font-semibold">{t("error.apiConnectionFailed")}</p>
          <p className="text-sm">{t("error.apiConnectionFailedDetails")}</p>
        </div>
        <Link to="/">{t("common.retry")}</Link>
      </Panel>
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

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 flex items-center justify-center">
      <div className="animate-spin h-6 w-6 border-b-2 border-indigo-600"></div>
    </div>
  );
}
