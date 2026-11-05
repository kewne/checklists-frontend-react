import { redirect, useSubmit } from "react-router";
import { useTranslation } from "react-i18next";
import {
    type LocationResponse,
    type Response as RestspecResponse,
} from "@kewne/restspec";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { RunEditForm } from "../../components/RunEditForm";
import { getUser } from "~/lib/auth";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import i18n from "~/lib/i18n";
import { useLocaleNavigate } from "~/lib/locale";
import type { Route } from "./+types/create";
import { createApiClient, linkFromHref, type ChecklistRun, type WriteableChecklistRun } from "~/lib/api";
import type { CreateChecklistInstanceRequest } from "~/lib/restspec-api";
import { showErrorToast, showSuccessToast } from "~/lib/toastHelpers";
import { type RouteHandle } from "../../lib/routeHandle";

export const handle: RouteHandle = {
  heading: { labelKey: "run.createTitle" },
};

export function meta({ }: Route.MetaArgs) {
    return [
        { title: i18n.t("meta.runCreate.title") },
        { name: "description", content: i18n.t("meta.runCreate.description") },
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
                            {t("error.invalidRunsUrl")}
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
    const link = linkFromHref<{
        post: [CreateChecklistInstanceRequest, LocationResponse<RestspecResponse, {}>];
    }>(decodeApiUrl(params.apiUrlEncoded));
    const data = (await request.json()) as CreateChecklistInstanceRequest;
    let location: string | undefined;
    try {
        const client = await createApiClient(user);
        const created = await client.post(link, data);
        location = created.location?.href;
    } catch (error) {
        const message = error instanceof Error ? error.message : i18n.t("toast.createRunFailed");
        showErrorToast(message);
        return;
    }
    if (!location) {
        showErrorToast(i18n.t("toast.createRunFailed"));
        return;
    }
    showSuccessToast(i18n.t("toast.runCreated"));
    return redirect(`/${params.locale}/runs/show/${encodeApiUrl(location)}`);
}

export default function CreateRun({}: Route.ComponentProps) {
    const navigate = useLocaleNavigate();
    const submit = useSubmit();
    const { t } = useTranslation();

    const handleSubmit = async (data: WriteableChecklistRun) => {
        await submit(data, { method: "post", encType: "application/json" });
    };

    const initialValues: ChecklistRun = {
        title: "",
        items: [],
    };

    return (
        <>
            <RunEditForm
                initialValues={initialValues}
                submitLabel={t("common.create")}
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
            />
        </>
    );
}
