import { useNavigate } from "react-router";
import { Link } from "~/components/Link";
import type { ChecklistRun, WriteableChecklistRun } from "~/lib/api";
import { RunEditForm } from "../../components/RunEditForm";
import { apiResourceActions } from "../../lib/api";
import { getUser } from "../../lib/auth";
import { decodeApiUrl } from "../../lib/encoding";
import { showErrorToast } from "../../lib/toastHelpers";
import type { Route } from "./+types/edit";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Edit Run" },
    { name: "description", content: "Edit checklist run details" },
  ];
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{String(error)}</p>
          </div>
          <Link to="/">
            Back to Home
          </Link>
        </div>
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
  const navigate = useNavigate();

  const handleSubmit = async (data: WriteableChecklistRun) => {
    try {
      await apiResourceActions<ChecklistRun, WriteableChecklistRun>(decodedUrl, user).put(data);
      navigate(`/runs/show/${params.apiUrlEncoded}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update run";
      showErrorToast(message);
    }
  };

  const handleCancel = () => {
    navigate(`/runs/show/${params.apiUrlEncoded}`);
  };

  return (
    <RunEditForm
      initialValues={runResource.properties}
      submitLabel="Save"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
