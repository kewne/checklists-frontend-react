import { useTranslation } from "react-i18next";
import { Heading } from "~/components/Heading";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { RunEditForm } from "../../components/RunEditForm";
import { useAuth } from "../../lib/auth";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import i18n from "~/lib/i18n";
import { useLocaleNavigate } from "~/lib/locale";
import type { Route } from "./+types/create";
import { apiResourceActions, type ChecklistRun, type WriteableChecklistRun } from "~/lib/api";
import { showErrorToast, showSuccessToast } from "~/lib/toastHelpers";

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

export default function CreateRun({ params }: Route.ComponentProps) {
    const { user } = useAuth();
    const navigate = useLocaleNavigate();
    const { t } = useTranslation();

    const decodedUrl = decodeApiUrl(params.apiUrlEncoded);

    const { post } = apiResourceActions(decodedUrl, user!);

    const handleSubmit = async (data: WriteableChecklistRun) => {
        try {
            const url = await post(data);
            if (!url) {
                showErrorToast(t("toast.createRunFailed"));
                return;
            }
            showSuccessToast(t("toast.runCreated"));
            const encodedUrl = encodeApiUrl(url);
            navigate(`/runs/show/${encodedUrl}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : t("toast.createRunFailed");
            showErrorToast(message);
        }
    };

    const initialValues: ChecklistRun = {
        title: "",
        items: [],
    };

    return (
        <>
            <Heading level="1">
                {t("run.createTitle")}
            </Heading>
            <RunEditForm
                initialValues={initialValues}
                submitLabel={t("common.create")}
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
            />
        </>
    );
}
