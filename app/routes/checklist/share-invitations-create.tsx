import { Form, redirect } from "react-router";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { TextInput } from "~/components/TextInput";
import { getUser } from "../../lib/auth";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import { apiResourceActions } from "~/lib/api";
import { showErrorToast } from "../../lib/toastHelpers";
import type { Route } from "./+types/share-invitations-create";
import { Button } from "~/components/Button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Share Invitation" },
    { name: "description", content: "Create a new share invitation" },
  ];
}

export function ErrorBoundary({}: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Panel>
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">
              Invalid URL. Please go back and try again.
            </p>
          </div>
          <Link to="/">Back to Home</Link>
        </Panel>
      </div>
    </div>
  );
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  if (request.method !== "POST") {
    throw new Response("Method not allowed", { status: 405 });
  }

  const user = await getUser();
  const formData = await request.formData();
  const title = formData.get("title");

  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const { post } = apiResourceActions<{ title: string }>(decodedUrl, user!);

  try {
    const newResourceUrl = await post({ title });
    if (newResourceUrl) {
      const encodedUrl = encodeApiUrl(newResourceUrl);
      return redirect(`/checklists/share-invitations/show/${encodedUrl}`);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create invitation";
    showErrorToast(message);
  }
}

export default function CreateShareInvitation(): React.JSX.Element {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create Share Invitation
      </h1>
      <Form method="POST" className="space-y-4">
        <Panel>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <TextInput
            id="title"
            name="title"
            type="text"
            required
          />
        </Panel>
        <div className="flex gap-3">
          <Button
            action="submit"
            type="primary"
            size="large"
          >
            Create
          </Button>
        </div>
      </Form>
    </>
  );
}
