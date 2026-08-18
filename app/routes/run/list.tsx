import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import { Button } from "~/components/Button";
import { Heading } from "~/components/Heading";
import { Link } from "~/components/Link";
import { List } from "~/components/List";
import { Panel } from "~/components/Panel";
import { apiResourceActions } from "../../lib/api";
import { getUser } from "../../lib/auth";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import i18n from "~/lib/i18n";
import { showErrorToast, showSuccessToast } from "../../lib/toastHelpers";
import type { Route } from "./+types/list";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.runList.title") },
    { name: "description", content: i18n.t("meta.runList.description") },
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
    showSuccessToast(i18n.t("toast.runDeleted"));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : i18n.t("toast.deleteFailed");
    showErrorToast(message);
  }
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const user = await getUser();
  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const runsResource = await apiResourceActions(decodedUrl, user).get();
  return { runsResource };
}

export default function ChecklistInstances({
  loaderData,
}: Route.ComponentProps) {
  const { runsResource } = loaderData;
  const { t } = useTranslation();
  const fetcher = useFetcher();

  const items = runsResource.getLinkArray("items");
  const createLink = runsResource.getFirstLinkMatching("create");

  const handleDelete = (href: string) => async () => {
    const formData = new FormData();
    formData.append("href", href);
    fetcher.submit(formData, { method: "delete" });
  };

  return (
    <>
      <Heading level="1">{t("run.title")}</Heading>
      {createLink && (
        <Link
          variant="inline-block"
          size="large"
          to={`/runs/create/${encodeApiUrl(createLink.href)}`}
        >
          {t("run.create")}
        </Link>
      )}
      {items.length === 0 ? (
        <div className="px-4 py-3 text-gray-500 text-sm">
          {t("run.empty")}
        </div>
      ) : (
        <List
          ariaLabel="checklist instances"
          items={items.map((item) => (
            <>
              <Link to={`/runs/show/${encodeApiUrl(item.href)}`}>
                {item.title ?? item.name}
              </Link>
              <Button variant="danger" action={handleDelete(item.href)}>
                {t("common.delete")}
              </Button>
            </>
          ))}
        />
      )}
    </>
  );
}
