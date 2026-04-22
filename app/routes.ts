import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  route("/login", "routes/login.tsx"),
  route("/reset-password", "routes/reset-password.tsx"),
  layout("components/ProtectedLayout.tsx", [
    layout("components/MenuLayout.tsx", [
      index("routes/home.tsx"),
      ...prefix("/checklists", [
        index("routes/checklists-redirect.tsx"),
        route("list/:apiUrlEncoded", "routes/checklists-list.tsx"),
        route("show/:apiUrlEncoded", "routes/checklists-show.tsx"),
      ]),
      route("/checklist-run/:apiUrlEncoded", "routes/checklist-run.tsx"),
      route("/checklist-instances/:apiUrlEncoded", "routes/checklist-instances.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
