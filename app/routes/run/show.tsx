import { redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { ChecklistRunDetail } from "../../components/ChecklistRunDetail";
import { apiResourceActions, createApiClient, getApiResource, linkFromHref } from "../../lib/api";
import { getUser } from "../../lib/auth";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import i18n from "~/lib/i18n";
import { useLocaleNavigate } from "~/lib/locale";
import { showErrorToast, showSuccessToast } from "~/lib/toastHelpers";
import { resourceHeading, type RouteHandle } from "../../lib/routeHandle";
import type { Route } from "./+types/show";
import type { LocationResponse, Response as RestspecResponse } from "@kewne/restspec";
import type {
  ChecklistInstance,
  CompleteChecklistInstanceItemRequest,
  CreateChecklistFromInstanceRequest,
} from "~/lib/restspec-api";

export const handle: RouteHandle<{
  runResource: ChecklistInstance;
}> = {
  heading: ({ runResource }) => ({
    labelKey: "run.showTitle",
    values: { title: resourceHeading(runResource, "title") ?? "" },
  }),
};

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
  const runResource = await getApiResource<ChecklistInstance>(decodedUrl, user);
  return { runResource, user, decodedUrl };
}

export async function clientAction({ params, request }: Route.ClientActionArgs) {
  const user = await getUser();
  const formData = await request.formData();
  const intent = formData.get("intent");
  const href = formData.get("href");
  if (typeof href !== "string") {
    throw new Response("Invalid request", { status: 400 });
  }
  const client = await createApiClient(user);

  if (intent === "clear-completed") {
    const link = linkFromHref<{ post: [void, unknown] }>(href);
    try {
      await client.post(link);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : i18n.t("toast.updateRunFailed");
      showErrorToast(message);
      return;
    }
    showSuccessToast(i18n.t("toast.completedItemsCleared"));
    return;
  }

  if (intent === "complete-item" || intent === "mark-incomplete-item") {
    const link = linkFromHref<{
      post: [CompleteChecklistInstanceItemRequest, unknown];
    }>(href);
    try {
      await client.post(link, {});
    } catch (error) {
      const message =
        error instanceof Error ? error.message : i18n.t("toast.updateRunFailed");
      showErrorToast(message);
    }
    return;
  }

  const title = formData.get("title");
  if (intent !== "create-checklist" || typeof title !== "string") {
    throw new Response("Invalid request", { status: 400 });
  }
  const link = linkFromHref<{
    post: [
      CreateChecklistFromInstanceRequest,
      LocationResponse<RestspecResponse, {}>,
    ];
  }>(href);
  let location: string | undefined;
  try {
    const created = await client.post(link, { title });
    location = created.location?.href;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : i18n.t("toast.createChecklistFailed");
    showErrorToast(message);
    return;
  }
  if (!location) {
    return redirect(`/${params.locale}/checklists`);
  }
  return redirect(`/${params.locale}/checklists/show/${encodeApiUrl(location)}`);
}

export default function ChecklistRun({ loaderData, params }: Route.ComponentProps) {
  const { runResource, user, decodedUrl } = loaderData;
  const navigate = useLocaleNavigate();

  const doDelete = async () => {
    await apiResourceActions(decodedUrl, user).delete();
    navigate("/");
  };

  return (
    <ChecklistRunDetail
      resource={runResource}
      onDelete={doDelete}
    />
  );
}
