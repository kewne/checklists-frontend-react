import { NavLink, Outlet } from "react-router";
import { useAuth } from "../lib/auth";
import { useResource } from "../lib/useResource";
import { Button } from "./Button";

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
        `px-4 py-2 rounded-md font-medium text-sm ${isActive
          ? "bg-indigo-600 text-white"
          : "bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function MenuLayout() {
  const { user, signOut } = useAuth();
  const { state } = useResource("https://api.checklists.keeoon.dev/", user!);

  const checklistsLink =
    state.status === "success"
      ? state.resource.getFirstLinkMatching("related", (link) => link.name === "checklists")
      : null;
  const instancesLink =
    state.status === "success"
      ? state.resource.getFirstLinkMatching("related", (link) => link.name === "checklist-instances")
      : null;

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
