import { Outlet, redirect } from "react-router";
import { getUser } from "../lib/auth";

export async function clientLoader() {
  try {
    await getUser();
  } catch {
    return redirect("/login");
  }
  return {};
}

export default function ProtectedLayout() {
  return <Outlet />;
}
