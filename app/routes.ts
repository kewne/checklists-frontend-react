import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  route("/login", "routes/login.tsx"),
  route("/reset-password", "routes/reset-password.tsx"),
  layout("components/ProtectedLayout.tsx", [
    layout("components/MenuLayout.tsx", [
      index("routes/home.tsx"),
      route("/checklists/:apiUrlEncoded", "routes/checklists.tsx"),
      route("/checklist/:apiUrlEncoded", "routes/checklist.tsx"),
      route("/checklist-run/:apiUrlEncoded", "routes/checklist-run.tsx"),
      route("/checklist-instances/:apiUrlEncoded", "routes/checklist-instances.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
