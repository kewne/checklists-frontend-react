import type { User } from "firebase/auth";
import { useResource } from "../lib/useResource";
import { ChecklistForm } from "./ChecklistForm";
import { ChecklistList } from "./ChecklistList";
import { useState } from "react";

export function ChecklistHome({ href, user }: { href: string; user: User }) {
  const { state, get, post } = useResource(href, user);
  const [formVisible, setFormVisible] = useState(false)

  return (
    <>
      {formVisible ?
         (<ChecklistForm submitLabel="Create" onCancel={() => setFormVisible(false)} onSubmit={post} />)
        : (<button
        onClick={() => setFormVisible(true)}
              className="mb-4 bg-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-indigo-700"
            >Create</button>)}
      <ChecklistList state={state} get={get} user={user} />
    </>
  );
}
