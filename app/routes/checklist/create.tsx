import { useNavigate } from "react-router";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { apiResourceActions } from "~/lib/api";
import { showErrorToast, showSuccessToast } from "~/lib/toastHelpers";
import { ChecklistForm } from "../../components/ChecklistForm";
import { useAuth } from "../../lib/auth";
import { decodeApiUrl } from "../../lib/encoding";
import type { Route } from "./+types/create";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Create Checklist" },
    { name: "description", content: "Create a new checklist" },
  ];
}

export function ErrorBoundary({ }: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Panel>
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">
              Invalid checklists URL. Please go back and try again.
            </p>
          </div>
          <Link to="/">
            Back to Home
          </Link>
        </Panel>
      </div>
    </div>
  );
}

export default function CreateChecklist({ params }: Route.ComponentProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);

  const { post } = apiResourceActions(decodedUrl, user!);

  const handleSubmit = async (data: {
    title: string;
    items: Array<{ title: string; description: string }>;
  }) => {
    try {
      await post(data);
      showSuccessToast("Checklist created successfully");
      navigate(`/checklists/list/${params.apiUrlEncoded}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create checklist";
      showErrorToast(message);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create New Checklist
      </h1>
      <ChecklistForm
        submitLabel="Create"
        onSubmit={handleSubmit}
        onCancel={async () => navigate(`/checklists/list/${params.apiUrlEncoded}`)}
      />
    </>
  );
}
