import { Navigate, useLocation } from "react-router";
import { getDetectedLocale } from "~/lib/i18n";

/**
 * Redirects requests to `/` (and legacy non-locale URLs caught by the
 * splat route) to the detected locale, preserving the path, query and hash.
 */
export default function LocaleRedirect() {
  const location = useLocation();
  const locale = getDetectedLocale();
  const path = location.pathname === "/" ? "" : location.pathname;
  return (
    <Navigate
      to={`/${locale}${path}${location.search}${location.hash}`}
      replace
    />
  );
}
