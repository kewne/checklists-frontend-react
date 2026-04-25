import type { User } from "firebase/auth";
import { Link } from "react-router";
import { useResource } from "../lib/useResource";
import { ChecklistList } from "./ChecklistList";

export function ChecklistHome({ href, user, apiUrlEncoded }: { href: string; user: User; apiUrlEncoded: string }) {
  const { state, get } = useResource(href, user);

  return (
    <>
      <Link
        to={`/checklists/create/${apiUrlEncoded}`}
        className="inline-block mb-4 bg-indigo-600 px-4 py-2 rounded-md font-medium text-white hover:bg-indigo-700"
      >
        Create Checklist
      </Link>
      <ChecklistList state={state} get={get} user={user} />
    </>
  );
}
