import type { User } from "firebase/auth";
import { useResource } from "../lib/useResource";
import { CreateChecklistForm } from "./CreateChecklistForm";
import { ChecklistList } from "./ChecklistList";

export function ChecklistHome({ href, user }: { href: string; user: User }) {
  const { state, get, post } = useResource(href, user);

  return (
    <>
      <CreateChecklistForm onSuccess={post} />
      <ChecklistList state={state} get={get} user={user} />
    </>
  );
}
