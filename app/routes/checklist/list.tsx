import { useFetcher } from "react-router";
import { Button } from "~/components/Button";
import { Link } from "~/components/Link";
import { List } from "~/components/List";
import { Panel } from "~/components/Panel";
import { apiResourceActions } from "~/lib/api";
import { getUser } from "~/lib/auth";
import { encodeApiUrl } from "~/lib/encoding";
import { decodeApiUrl } from "../../lib/encoding";
import { showErrorToast, showSuccessToast } from "../../lib/toastHelpers";
import type { Route } from "./+types/list";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Checklists" },
    { name: "description", content: "Manage your checklists" },
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

export async function clientAction({ request }: Route.ClientActionArgs) {
  const method = request.method.toLowerCase();

  if (method !== "delete") {
    throw new Response("Method not allowed", { status: 405 });
  }

  const user = await getUser();
  const formData = await request.formData();
  const href = formData.get("href");

  if (typeof href !== "string") {
    throw new Response("Invalid href", { status: 400 });
  }

  try {
    const resource = apiResourceActions(href, user);
    await resource.delete();
    showSuccessToast("Checklist deleted successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete checklist";
    showErrorToast(message);
  }
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const user = await getUser();
  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const checklistsResource = await apiResourceActions(decodedUrl, user).get();
  return { checklistsResource, user };
}

export default function ChecklistList({ loaderData, params }: Route.ComponentProps) {
  const { checklistsResource } = loaderData;
  const fetcher = useFetcher();
  const items = checklistsResource.getLinkArray("items");

  const handleDelete = (href: string) => async () => {
    const formData = new FormData();
    formData.append("href", href);
    fetcher.submit(formData, { method: "delete" });
  };

  return (
    <div>
      <Link variant="inline-block" size="large" to={`/checklists/create/${params.apiUrlEncoded}`}>
        Create Checklist
      </Link>
      {items.length === 0 ? (
        <div className="px-4 py-3 text-gray-500 text-sm">
          No checklists found.
        </div>
      ) : (
        <List
          ariaLabel="checklists"
          items={items.map((item) => (
            <>
              <Link to={`/checklists/show/${encodeApiUrl(item.href)}`}>
                {item.title ?? item.name}
              </Link>
              <Button variant="danger" action={handleDelete(item.href)}>
                Delete
              </Button>
            </>
          ))}
        />
      )}
    </div>
  );
}
