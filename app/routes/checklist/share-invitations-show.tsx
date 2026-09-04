import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { Heading } from "~/components/Heading";
import { Link } from "~/components/Link";
import { Panel } from "~/components/Panel";
import { apiResourceActions } from "../../lib/api";
import { getUser } from "../../lib/auth";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import i18n from "~/lib/i18n";
import { useLocale } from "~/lib/locale";
import type { Route } from "./+types/share-invitations-show";

type ShareInvitation = {
  title: string;
  checklistTitle: string;
  createdAt: string;
  expiresAt: string;
};

function CopyShareUrlButton({ shareUrl }: { shareUrl: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard errors; the URL is still visible for manual copying.
    }
  };

  return (
    <Button action={handleCopy} type="secondary" size="medium">
      {copied ? t("share.copied") : t("share.copy")}
    </Button>
  );
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("meta.shareInvitationShow.title") },
    { name: "description", content: i18n.t("meta.shareInvitationShow.description") },
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

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const user = await getUser();
  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);
  const invitationResource = await apiResourceActions<ShareInvitation>(
    decodedUrl,
    user,
  ).get();
  return { invitationResource };
}

export default function ShareInvitationShow({
  loaderData,
}: Route.ComponentProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { invitationResource } = loaderData;
  const { title, checklistTitle, createdAt, expiresAt } =
    invitationResource.properties;
  const previewLink = invitationResource.getFirstLinkMatching("preview");
  const shareUrl = previewLink
    ? `${window.location.origin}/${locale}/checklists/share-invitations/accept/${encodeApiUrl(previewLink.href)}`
    : undefined;

  return (
    <>
      <Heading level="1">{title}</Heading>
      <Panel>
        <p className="text-sm text-gray-600">{t("share.checklistLabel", { title: checklistTitle })}</p>
        <p className="text-sm text-gray-600">
          {t("share.createdAt", { date: new Date(createdAt).toLocaleString() })}
        </p>
        <p className="text-sm text-gray-600">
          {t("share.expiresAt", { date: new Date(expiresAt).toLocaleString() })}
        </p>
        {previewLink && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-1">
              {t("share.shareLinkPrompt")}
            </p>
            <pre className="bg-gray-100 border border-gray-200 px-4 py-3 text-gray-600 text-sm break-all whitespace-pre-wrap">
              {shareUrl}
            </pre>
            <div className="mt-2">
              {typeof navigator !== "undefined" && navigator.share ? (
                <Button
                  action={() => navigator.share({ url: shareUrl })}
                  type="secondary"
                  size="medium"
                >
                  {t("share.share")}
                </Button>
              ) : (
                <CopyShareUrlButton shareUrl={shareUrl as string} />
              )}
            </div>
          </div>
        )}
      </Panel>
    </>
  );
}
