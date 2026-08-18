import { useNavigate, useParams } from "react-router";
import { DEFAULT_LOCALE, isLocale, type SupportedLocale } from "./i18n";

/**
 * Returns the locale from the current `:locale` route param.
 * Falls back to the default locale when used outside a locale route.
 */
export function useLocale(): SupportedLocale {
  const { locale } = useParams();
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

/**
 * Prepends the locale prefix to an internal absolute path.
 * External URLs (http(s):, mailto:), anchors, and already-prefixed
 * paths are returned unchanged.
 */
export function localePath(path: string, locale: SupportedLocale): string {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.startsWith(`/${locale}/`) ||
    path === `/${locale}`
  ) {
    return path;
  }
  if (path === "/") {
    return `/${locale}`;
  }
  return `/${locale}${path}`;
}

/**
 * Locale-aware wrapper around React Router's `useNavigate`.
 * Absolute string paths get the locale prefix prepended; relative
 * paths, numbers (e.g. `navigate(-1)`) and `To` objects pass through.
 */
export function useLocaleNavigate() {
  const navigate = useNavigate();
  const locale = useLocale();

  return ((to: any, options?: any) => {
    if (typeof to === "string") {
      return navigate(localePath(to, locale), options);
    }
    return navigate(to, options);
  }) as ReturnType<typeof useNavigate>;
}
