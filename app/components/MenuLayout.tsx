import { NavLink, Outlet, useLocation, useNavigate, useRevalidator } from "react-router";
import { useTranslation } from "react-i18next";
import { apiResourceActions } from "../lib/api";
import { getUser, useAuth } from "../lib/auth";
import { SUPPORTED_LOCALES } from "~/lib/i18n";
import { localePath, useLocale } from "~/lib/locale";
import type { Route } from "./+types/MenuLayout";
import { Button } from "./Button";

interface MenuLinkProps {
  link: unknown | null;
  to: string;
  children: React.ReactNode;
}

function MenuLink({ link, to, children }: MenuLinkProps) {
  if (!link) return null;

  const baseClasses = [
    "block",
    "px-4",
    "py-2",
    "border",
    "text-sm",
    "text-emerald-700",
    "underline",
    "underline-offset-4",
    "hover:border-emerald-500",
    "hover:outline",
    "hover:outline-emerald-500",
    "focus-visible:border",
    "focus-visible:border-emerald-500",
    "focus-visible:outline",
    "focus-visible:outline-emerald-500",
    "dark:text-emerald-600",
    "dark:hover:border-emerald-400",
    "dark:hover:outline-emerald-400",
    "dark:focus-visible:border-emerald-400",
    "dark:focus-visible:outline-emerald-400",
  ];
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          ...baseClasses,
          ...(isActive
            ? ["border-emerald-700", "decoration-solid", "outline-emerald-700", "dark:border-emerald-600", "dark:outline-emerald-600"]
            : [
                "border-gray-200",
                "decoration",
                "decoration-gray-100",
                "hover:decoration-emerald-500",
                "dark:border-gray-700",
                "dark:decoration-gray-800",
                "dark:hover:decoration-emerald-400",
              ]),
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export async function clientLoader() {
  const user = await getUser();
  const rootResource = await apiResourceActions(
    "https://api.checklists.keeoon.dev/",
    user,
  ).get();
  const checklistsLink = rootResource.getFirstLinkMatching(
    "related",
    (link) => link.name === "checklists",
  );
  const instancesLink = rootResource.getFirstLinkMatching(
    "related",
    (link) => link.name === "checklist-instances",
  );
  return { checklistsLink, instancesLink };
}

function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const locale = useLocale();
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value;
    i18n.changeLanguage(nextLocale);
    const rest = location.pathname.replace(/^\/[^/]+/, "") || "/";
    navigate(`/${nextLocale}${rest === "/" ? "" : rest}${location.search}${location.hash}`);
  };

  return (
    <select
      aria-label={t("nav.language")}
      value={locale}
      onChange={handleChange}
      className="border border-gray-200 text-sm px-2 py-1 bg-white text-gray-700 dark:bg-black dark:text-gray-100 dark:border-gray-700"
    >
      {SUPPORTED_LOCALES.map((l) => (
        <option key={l} value={l}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}

export default function MenuLayout({ loaderData }: Route.ComponentProps) {
  const { checklistsLink, instancesLink } = loaderData;
  const { signOut } = useAuth();
  const { revalidate } = useRevalidator();
  const { t } = useTranslation();
  const locale = useLocale();

  const handleSignOut = async () => {
    await signOut();
    revalidate();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black">
      <nav className="bg-white border-b border-gray-300 dark:bg-black dark:border-gray-700 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-3 justify-between items-center">
          <div className="flex gap-3">
            <MenuLink link={instancesLink} to={localePath("/runs", locale)}>
              {t("nav.runs")}
            </MenuLink>
            <MenuLink link={checklistsLink} to={localePath("/checklists", locale)}>
              {t("nav.checklists")}
            </MenuLink>
          </div>
          <div className="flex gap-3 items-center">
            <LanguageSwitcher />
            <Button variant="danger" size="large" action={handleSignOut}>
              {t("nav.signOut")}
            </Button>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto py-8 px-4">
          <Outlet />
      </div>
    </div>
  );
}
