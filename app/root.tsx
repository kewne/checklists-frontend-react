import "./app.css";

import "react-toastify/dist/ReactToastify.css";
import { Heading } from "~/components/Heading";

import "@firebase-oss/ui-styles/dist.min.css";

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/root";
import { AuthProvider } from "./lib/auth";
import { Link } from "./components/Link";
import "./lib/i18n";

const siteUrl = "https://checklists.keeoon.dev";
const themeColor = "#10B981";

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/png", sizes: "32x32", href: "/icons/favicon-32x32.png" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/icons/apple-touch-icon.png" },
  { rel: "apple-touch-startup-image", href: "/icons/startup/startup-2048x2732.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" },
  { rel: "apple-touch-startup-image", href: "/icons/startup/startup-1668x2388.png", media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" },
  { rel: "apple-touch-startup-image", href: "/icons/startup/startup-1284x2778.png", media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" },
  { rel: "apple-touch-startup-image", href: "/icons/startup/startup-1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
  { rel: "apple-touch-startup-image", href: "/icons/startup/startup-1125x2436.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" },
  { rel: "apple-touch-startup-image", href: "/icons/startup/startup-750x1334.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" },
  { rel: "manifest", href: "/site.webmanifest" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Merriweather+Sans:ital,wght@0,300..800;1,300..800&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const socialTitle = t("meta.social.title");
  const socialDescription = t("meta.social.description");
  const ogImageUrl = `${siteUrl}/og-image.png`;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={themeColor} />
        <meta property="og:title" content={socialTitle} />
        <meta property="og:description" content={socialDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:site_name" content="CheckOff" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={socialTitle} />
        <meta name="twitter:description" content={socialDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { t } = useTranslation();
  let message = t("error.oops");
  let details = t("error.unexpected");
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? t("error.notFound") : t("error.title");
    details =
      error.status === 404
        ? t("error.notFoundDetails")
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <Heading level="1">{message}</Heading>
      <p className="text-gray-800 dark:text-gray-300">{details}</p>
      <p className="mt-4">
        <Link to="/">{t("common.backToHome")}</Link>
      </p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
