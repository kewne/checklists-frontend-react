import { NavLink, useNavigate } from "react-router";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { apiResourceActions, type Checklist } from "~/lib/api";
import { getUser } from "~/lib/auth";
import { Button } from "../../components/Button";
import { Heading } from "../../components/Heading";
import { HexCheckbox } from "../../components/HexCheckbox";
import { List } from "../../components/List";
import { QrCode } from "../../components/QrCode";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import { renderWithLinks } from "../../lib/renderWithLinks";
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
        <Panel>
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
        </Panel>
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
  return { checklistResource, decodedUrl };
}

function findItemUrls(description: string | undefined): string[] {
  if (!description) return [];
  return description.split(/(\s+)/).filter((token) => {
    const url = URL.parse(token);
    return url?.protocol === "https:" || url?.protocol === "mailto:";
  });
}

function urlLabel(token: string): string {
  const url = URL.parse(token);
  if (url?.protocol === "mailto:") {
    return url.pathname;
  }
  return url?.hostname ?? token;
}

export default function ChecklistShow({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();

  const { checklistResource, decodedUrl } = loaderData;
  const { title, items } = checklistResource.properties;

  const createInstanceLink = checklistResource.getFirstLinkMatching(
    "create-from",
    (link) => link.name === "instance",
  );

  const sharesLink = checklistResource.getFirstLinkMatching(
    "related",
    (link) => link.name === "shares",
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-x-2 mb-4 print:hidden">
        <div>
          {createInstanceLink ? (
            <Button
              type="primary"
              size="large"
              action={async () => {
                const location = await createInstanceLink.actions().post({
                  title,
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
          <Link
            variant="inline-block"
            size="large"
            to={`/checklists/edit/${encodeApiUrl(decodedUrl)}`}
          >
            Edit
          </Link>
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
      <Heading level={1}>{title}</Heading>
      <List
        ariaLabel="checklist items"
        items={items.map((item) => {
          const itemUrls = findItemUrls(item.description);
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 print:break-inside-avoid w-full"
            >
              <HexCheckbox className="hidden h-5 w-5 shrink-0 print:block" />
              <div className="grow">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap dark:text-gray-400">
                    {renderWithLinks(item.description)}
                  </p>
                )}
              </div>
              <div>
              {itemUrls.map((itemUrl) => (
                <div
                  key={itemUrl}
                  className="hidden shrink-0 text-center print:block"
                >
                  <QrCode value={itemUrl} className="h-24 w-24" />
                  <p className="text-[10px] text-gray-600">
                    {urlLabel(itemUrl)}
                  </p>
                </div>
              ))}
              </div>
            </div>
          );
        })}
      />
      <div className="hidden mt-8 text-center print:block print:break-inside-avoid">
        <QrCode value={window.location.origin} className="mx-auto h-24 w-24" />
        <p className="text-[10px] text-gray-600">
          Get the app: {urlLabel(window.location.origin)}
        </p>
      </div>
    </div>
  );
}
