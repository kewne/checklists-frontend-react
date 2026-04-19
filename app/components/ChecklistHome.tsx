import type { User } from "firebase/auth";
import { useResource } from "../lib/useResource";
import { ChecklistForm } from "./ChecklistForm";
import { ChecklistList } from "./ChecklistList";

export function ChecklistHome({ href, user }: { href: string; user: User }) {
  const { state, get, post } = useResource(href, user);

  return (
    <>
      <ChecklistForm onSuccess={post} />
      <ChecklistList state={state} get={get} user={user} />
    </>
  );
}
