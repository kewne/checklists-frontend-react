import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useLocation, useParams } from "react-router";
import { getDetectedLocale, isLocale } from "~/lib/i18n";

/**
 * Layout for the `/:locale` route segment. Validates the locale param,
 * syncs it with i18next, and keeps `<html lang>` up to date.
 * Requests with a missing or unsupported locale are redirected to the
 * detected locale, preserving the rest of the path.
 */
export default function LocaleLayout() {
  const { locale } = useParams();
  const location = useLocation();
  const { i18n } = useTranslation();

  const validLocale = isLocale(locale) ? locale : null;

  useEffect(() => {
    if (validLocale) {
      if (i18n.language !== validLocale) {
        i18n.changeLanguage(validLocale);
      }
      document.documentElement.lang = validLocale;
    }
  }, [validLocale, i18n]);

  if (!validLocale) {
    const detected = getDetectedLocale();
    const rest = location.pathname.replace(/^\/[^/]+/, "") || "/";
    return (
      <Navigate
        to={`/${detected}${rest}${location.search}${location.hash}`}
        replace
      />
    );
  }

  return (
    <Outlet />
  );
}
