import { useNavigate } from "react-router";
import { Link } from "~/components/Link";
import { RunEditForm } from "../../components/RunEditForm";
import { useAuth } from "../../lib/auth";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import type { Route } from "./+types/create";
import { apiResourceActions, type ChecklistRun, type WriteableChecklistRun } from "~/lib/api";
import { showErrorToast, showSuccessToast } from "~/lib/toastHelpers";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Create Run" },
        { name: "description", content: "Create a new checklist run" },
    ];
}

export function ErrorBoundary({ }: Route.ErrorBoundaryProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="bg-white shadow p-6">
                    <div className="text-red-600 mb-4">
                        <p className="font-semibold">Error</p>
                        <p className="text-sm">
                            Invalid runs URL. Please go back and try again.
                        </p>
                    </div>
                    <Link to="/">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CreateRun({ params }: Route.ComponentProps) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const decodedUrl = decodeApiUrl(params.apiUrlEncoded);

    const { post } = apiResourceActions(decodedUrl, user!);

    const handleSubmit = async (data: WriteableChecklistRun) => {
        try {
            const url = await post(data);
            if (!url) {
                showErrorToast("Failed to create run");
                return;
            }
            showSuccessToast("Run created successfully");
            const encodedUrl = encodeApiUrl(url);
            navigate(`/runs/show/${encodedUrl}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create run";
            showErrorToast(message);
        }
    };

    const initialValues: ChecklistRun = {
        title: "",
        items: [],
    };

    return (
        <>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Create New Run
            </h1>
            <RunEditForm
                initialValues={initialValues}
                submitLabel="Create"
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
            />
        </>
    );
}
