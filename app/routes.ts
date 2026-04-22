import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/reset-password", "routes/reset-password.tsx"),
  route("/checklists/:apiUrlEncoded", "routes/checklist.tsx"),
  route("/checklist-run/:apiUrlEncoded", "routes/checklist-run.tsx"),
] satisfies RouteConfig;
