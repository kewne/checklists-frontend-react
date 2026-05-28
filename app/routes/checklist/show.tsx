import { NavLink, useNavigate, useRevalidator } from "react-router";
import { Link } from "~/components/Link";

import { apiResourceActions, type Checklist } from "~/lib/api";
import { getUser } from "~/lib/auth";
import { showErrorToast } from "~/lib/toastHelpers";
import { Button } from "../../components/Button";
import { ChecklistForm } from "../../components/ChecklistForm";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import type { Route } from "./+types/show";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Checklist Detail" },
    { name: "description", content: "View checklist details" },
  ];
}

export function ErrorBoundary({}: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">
              Invalid checklist URL. Please go back and try again.
            </p>
          </div>
          <NavLink
            to="/"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700"
          >
            Back to Checklists
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const user = await getUser();
  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const checklistResource = await apiResourceActions<Checklist>(
    decodedUrl,
    user,
  ).get();
  return { checklistResource, user, decodedUrl };
}

export default function ChecklistDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();

  const { checklistResource, user, decodedUrl } = loaderData;

  const createInstanceLink = checklistResource.getFirstLinkMatching(
    "create-from",
    (link) => link.name === "instance",
  );

  const sharesLink = checklistResource.getFirstLinkMatching(
    "related",
    (link) => link.name === "shares",
  );

  const handleSubmit = async (data: Checklist) => {
    try {
      await apiResourceActions<{ title: string }>(decodedUrl, user).put(data);
      revalidate();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update checklist";
      showErrorToast(message);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-x-2 mb-4">
        <div>
          {createInstanceLink ? (
            <Button
              type="primary"
              size="large"
              action={async () => {
                const location = await createInstanceLink.actions().post({
                  title: checklistResource.properties.title,
                });
                if (!location) {
                  return navigate("/runs");
                }
                navigate(`/runs/show/${encodeApiUrl(location)}`);
              }}
            >
              Run
            </Button>
          ) : null}
        </div>
        <div className="space-x-2">
          {sharesLink && (
            <Link
              variant="inline-block"
              size="large"
              to={`/checklists/shares/list/${encodeApiUrl(sharesLink.href)}`}
            >
              Shares
            </Link>
          )}
        </div>
      </div>
      <ChecklistForm
        initialValues={checklistResource.properties}
        submitLabel="Save"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
