import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { SUPPORTED_LOCALES } from "~/lib/i18n";
import { useLocale } from "~/lib/locale";

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const locale = useLocale();
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value;
    i18n.changeLanguage(nextLocale);
    const rest = location.pathname.replace(/^\/[^/]+/, "") || "/";
    navigate(
      `/${nextLocale}${rest === "/" ? "" : rest}${location.search}${location.hash}`,
    );
  };

  return (
    <select
      aria-label={t("nav.language")}
      value={locale}
      onChange={handleChange}
      className="border border-gray-300 text-sm px-2 py-2 bg-white text-gray-800 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-black dark:text-white dark:border-gray-700 dark:hover:border-emerald-400 dark:focus:ring-emerald-600"
    >
      {SUPPORTED_LOCALES.map((l) => (
        <option key={l} value={l}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
