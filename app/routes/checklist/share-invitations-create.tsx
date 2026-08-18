import { Form, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { Heading } from "~/components/Heading";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { TextInput } from "~/components/TextInput";
import { getUser } from "../../lib/auth";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import { apiResourceActions } from "~/lib/api";
import i18n from "~/lib/i18n";
import { showErrorToast } from "../../lib/toastHelpers";
import type { Route } from "./+types/share-invitations-create";
import { Button } from "~/components/Button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.shareInvitationCreate.title") },
    { name: "description", content: i18n.t("meta.shareInvitationCreate.description") },
  ];
}

export function ErrorBoundary({}: Route.ErrorBoundaryProps) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Panel>
          <div className="text-red-600 mb-4">
            <p className="font-semibold">{t("error.title")}</p>
            <p className="text-sm">
              {t("error.invalidUrl")}
            </p>
          </div>
          <Link to="/">{t("common.backToHome")}</Link>
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
      return redirect(`/${params.locale}/checklists/share-invitations/show/${encodedUrl}`);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : i18n.t("toast.createInvitationFailed");
    showErrorToast(message);
  }
}

export default function CreateShareInvitation(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <>
      <Heading level="1">
        {t("share.createTitle")}
      </Heading>
      <Form method="POST" className="space-y-4">
        <Panel>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("common.title")}
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
            {t("common.create")}
          </Button>
        </div>
      </Form>
    </>
  );
}
