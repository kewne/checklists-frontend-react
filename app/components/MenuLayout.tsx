import { NavLink, Outlet, useRevalidator } from "react-router";
import { apiResourceActions } from "../lib/api";
import { getUser, useAuth } from "../lib/auth";
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
  ];
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          ...baseClasses,
          ...(isActive
            ? ["border-emerald-700", "decoration-solid", "outline-emerald-700"]
            : [
                "border-gray-200",
                "decoration",
                "decoration-gray-100",
                "hover:decoration-emerald-500",
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

  const handleSignOut = async () => {
    await signOut();
    revalidate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-3 justify-between items-center">
          <div className="flex gap-3">
            <MenuLink link={instancesLink} to="/runs">
              Runs
            </MenuLink>
            <MenuLink link={checklistsLink} to="/checklists">
              Checklists
            </MenuLink>
          </div>
          <Button variant="danger" size="large" action={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
