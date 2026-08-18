import { Outlet, redirect } from "react-router";
import { getUser } from "../lib/auth";
import type { Route } from "./+types/ProtectedLayout";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  try {
    await getUser();
  } catch {
    return redirect(`/${params.locale}/login`);
  }
  return {};
}

export default function ProtectedLayout() {
  return <Outlet />;
}
