import { NavLink, Outlet } from "react-router";
import { apiResourceActions } from "../lib/api";
import { useAuth, getUser } from "../lib/auth";
import { Button } from "./Button";
import type { Route } from "./+types/MenuLayout";

interface MenuLinkProps {
  link: unknown | null;
  to: string;
  children: React.ReactNode;
}

function MenuLink({ link, to, children }: MenuLinkProps) {
  if (!link) return null;

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-2 rounded border border-gray-200 text-sm text-indigo-600 underline underline-offset-4 ${isActive
          ? "bg-gray-100 decoration-solid hover:outline"
          : "decoration decoration-gray-100 hover:decoration-indigo-400 hover:outline"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export async function clientLoader() {
  const user = await getUser();
  const rootResource = await apiResourceActions("https://api.checklists.keeoon.dev/", user).get();
  const checklistsLink = rootResource.getFirstLinkMatching("related", (link) => link.name === "checklists");
  const instancesLink = rootResource.getFirstLinkMatching("related", (link) => link.name === "checklist-instances");
  return { checklistsLink, instancesLink };
}

export default function MenuLayout({ loaderData }: Route.ComponentProps) {
  const { checklistsLink, instancesLink } = loaderData;
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-3 justify-between items-center">
          <div className="flex gap-3">
            <MenuLink link={instancesLink} to="/runs">Runs</MenuLink>
            <MenuLink link={checklistsLink} to="/checklists">Checklists</MenuLink>
          </div>
          <Button
            type="danger"
            variant="outline"
            size="large"
            action={handleSignOut}
          >
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
