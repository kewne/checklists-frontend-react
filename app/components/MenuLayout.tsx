import { Link, NavLink, Outlet, useNavigation, useRevalidator, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { apiResourceActions } from "../lib/api";
import { getUser, useAuth } from "../lib/auth";
import { localePath, useLocale } from "~/lib/locale";
import type { Route } from "./+types/MenuLayout";
import { Button } from "./Button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Loading } from "./Loading";
import { Logo } from "./Logo";
import { ChevronDown } from "../icons/ChevronDown";
import { ChevronUp } from "../icons/ChevronUp";
import { Panel } from "./Panel";

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

export default function MenuLayout({ loaderData }: Route.ComponentProps) {
  const { checklistsLink, instancesLink } = loaderData;
  const { signOut } = useAuth();
  const { revalidate } = useRevalidator();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const locale = useLocale();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLSpanElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search]);

  const handleSignOut = async () => {
    await signOut();
    revalidate();
  };

  const close = () => {
    setIsOpen(false);
    toggleRef.current?.querySelector("button")?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" && isOpen) {
      event.stopPropagation();
      close();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black">
      <nav className="bg-white border-b border-gray-300 dark:bg-black dark:border-gray-700 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3" ref={drawerRef} onKeyDown={handleKeyDown}>
          <span ref={toggleRef} className="block">
            <Button
              type="secondary"
              variant="normal"
              size="full"
              action={() => (isOpen ? close() : setIsOpen(true))}
              aria-label={t("nav.menu")}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Logo size="md" />
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">
                    CheckOff
                  </span>
                </span>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
              </span>
            </Button>
          </span>

          {isOpen ? (
            <div className="fixed inset-0 z-50">
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-black/50"
                onClick={close}
              />
              <div
                role="menu"
                aria-label={t("nav.menu")}
                className="absolute inset-x-0"
                style={{
                  top: toggleRef.current?.getBoundingClientRect().bottom ?? 0,
                }}
              >
                <Panel className="flex flex-col gap-2 max-w-4xl mx-auto px-4">
                  <MenuLink link={instancesLink} to={localePath("/runs", locale)}>
                    {t("nav.runs")}
                  </MenuLink>
                  <MenuLink link={checklistsLink} to={localePath("/checklists", locale)}>
                    {t("nav.checklists")}
                  </MenuLink>
                  <LanguageSwitcher />
                  <Button variant="danger" size="large" action={handleSignOut}>
                    {t("nav.signOut")}
                  </Button>
                </Panel>
              </div>
            </div>
          ) : null}
        </div>
      </nav>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {navigation.state === "loading" ? (
          <div
            role="status"
            aria-live="polite"
            className="flex min-h-[50vh] items-center justify-center"
          >
            <Loading />
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}
