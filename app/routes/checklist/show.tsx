import { Link, NavLink, useNavigate } from "react-router";

import { useAuth } from "../../lib/auth";
import { useResource } from "../../lib/useResource";
import { decodeApiUrl, encodeApiUrl } from "../../lib/encoding";
import { ChecklistForm } from "../../components/ChecklistForm";
import { Button } from "../../components/Button";
import type { Route } from "./+types/show";
import type { User } from "firebase/auth";
import { apiResourceActions, type Checklist } from "~/lib/api";
import { createFrom } from "~/lib/hateoas";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Checklist Detail" },
    { name: "description", content: "View checklist details" },
  ];
}

export function ErrorBoundary({}: Route.ErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">
              Invalid checklist URL. Please go back and try again.
            </p>
          </div>
          <NavLink
            to="/"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700"
          >
            Back to Checklists
          </NavLink>
        </div>
      </div>
    </div>
  );
}

interface RunButtonProps {
  href: string;
  user: User;
}

function RunButton({ href, user }: RunButtonProps) {
  const navigate = useNavigate();
  const { post: createRun } = apiResourceActions(href, user);

  const handleRun = async () => {
    const location = await createRun({});
    if (!location) {
      return navigate("/runs");
    }
    navigate(`/runs/show/${encodeApiUrl(location)}`);
  };

  return (
    <div className="mb-4 flex justify-end">
      <Button type="primary" size="large" action={handleRun}>
        Run
      </Button>
    </div>
  );
}

export default function ChecklistDetail({ params }: Route.ComponentProps) {
  const navigate = useNavigate();

  const { user } = useAuth();

  const decodedUrl = decodeApiUrl(params.apiUrlEncoded);

  const { state, put } = useResource<Checklist>(decodedUrl, user!);

  if (state.status === "loading") {
    return (
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
        <span className="text-gray-600">Loading checklist...</span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700 font-semibold">Failed to load checklist</p>
        <p className="text-red-600 text-sm mt-1">{state.error.message}</p>
      </div>
    );
  }

  const createInstanceAction = createFrom(
    state.resource,
    user!,
    (link) => link.name === "instance",
  );

  const shareInvitationsLink = state.resource.getFirstLinkMatching(
    "related",
    (link) => link.name === "share-invitations",
  );

  return (
    <div>
      {shareInvitationsLink && (
        <Link
          to={`/checklists/share-invitations/list/${encodeApiUrl(shareInvitationsLink.href)}`}
          className="inline-block mb-4 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Manage Invitations
        </Link>
      )}
      {createInstanceAction ? (
        <Button
          type="primary"
          size="large"
          action={async () => {
            const location = await createInstanceAction({
              title: state.resource.properties.title,
            });
            if (!location) {
              return navigate("/runs");
            }
            navigate(`/runs/show/${encodeApiUrl(location)}`);
          }}
        >
          Run
        </Button>
      ) : null}
      <ChecklistForm
        initialValues={state.resource.properties}
        submitLabel="Save"
        onSubmit={put}
      />
    </div>
  );
}
