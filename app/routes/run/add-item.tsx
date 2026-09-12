import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { TextArea } from "~/components/TextArea";
import { TextInput } from "~/components/TextInput";
import { apiResourceActions } from "~/lib/api";
import i18n from "~/lib/i18n";
import { useLocaleNavigate } from "~/lib/locale";
import { showSuccessToast } from "~/lib/toastHelpers";
import { Button } from "../../components/Button";
import { useAuth } from "../../lib/auth";
import { decodeApiUrl } from "../../lib/encoding";
import { type RouteHandle } from "../../lib/routeHandle";
import type { Route } from "./+types/add-item";

export const handle: RouteHandle = {
  heading: { labelKey: "run.addItemTitle" },
};

export function meta({ }: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.runAddItem.title") },
    { name: "description", content: i18n.t("meta.runAddItem.description") },
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
              {t("error.invalidUrl")}
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

export default function AddItem({ params }: Route.ComponentProps) {
  const { user } = useAuth();
  const navigate = useLocaleNavigate();
  const { t } = useTranslation();

  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const { post } = apiResourceActions<{ title: string; description?: string }>(
    decodedUrl,
    user!,
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [addMore, setAddMore] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await post({ title, description: description || undefined });

    if (addMore) {
      showSuccessToast(t("toast.itemAdded"));
      setTitle("");
      setDescription("");
      return;
    }

    navigate(-1);
  };

  const handleCancel = async () => {
    navigate(-1);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("common.title")}
          </label>
          <TextInput
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("common.description")}
            <span className="text-gray-400 font-normal"> {t("common.optional")}</span>
          </label>
          <TextArea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={addMore}
              onChange={(e) => setAddMore(e.target.checked)}
              className="h-4 w-4"
            />
            <span>{t("run.addMore")}</span>
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button action={handleCancel}>
            {t("common.cancel")}
          </Button>
          <Button
            action="submit"
            type="primary"
          >
            {t("run.addItemTitle")}
          </Button>
        </div>
      </form>
    </>
  );
}
