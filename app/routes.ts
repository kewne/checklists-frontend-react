import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  route("/login", "routes/login.tsx"),
  route("/reset-password", "routes/reset-password.tsx"),
  layout("components/ProtectedLayout.tsx", [
    layout("components/MenuLayout.tsx", [
      index("routes/home.tsx"),
      ...prefix("/checklists", [
        index("routes/checklists-redirect.tsx"),
        route("create/:apiUrlEncoded", "routes/checklist-create.tsx"),
        route("list/:apiUrlEncoded", "routes/checklists-list.tsx"),
        route("show/:apiUrlEncoded", "routes/checklists-show.tsx"),
      ]),
      ...prefix("/runs", [
        index("routes/runs-redirect.tsx"),
        route("run/:apiUrlEncoded", "routes/checklist-run.tsx"),
        route("instances/:apiUrlEncoded", "routes/checklist-instances.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
