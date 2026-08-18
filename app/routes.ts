import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  route("/", "routes/locale-redirect.tsx"),
  route(":locale", "components/LocaleLayout.tsx", [
    route("login", "routes/login.tsx"),
    route("reset-password", "routes/reset-password.tsx"),
    layout("components/ProtectedLayout.tsx", [
      layout("components/MenuLayout.tsx", [
        index("routes/home.tsx"),
        ...prefix("checklists", [
          index("routes/checklist/index.tsx"),
          route("create/:apiUrlEncoded", "routes/checklist/create.tsx"),
          route("list/:apiUrlEncoded", "routes/checklist/list.tsx"),
          route("show/:apiUrlEncoded", "routes/checklist/show.tsx"),
          route("edit/:apiUrlEncoded", "routes/checklist/edit.tsx"),
          ...prefix("share-invitations", [
            route(
              "create/:apiUrlEncoded",
              "routes/checklist/share-invitations-create.tsx",
            ),
            route(
              "show/:apiUrlEncoded",
              "routes/checklist/share-invitations-show.tsx",
            ),
            route(
              "accept/:apiUrlEncoded",
              "routes/checklist/share-invitations-accept.tsx",
            ),
          ]),
          ...prefix("shares", [
            route("list/:apiUrlEncoded", "routes/checklist/shares.tsx"),
          ]),
        ]),
        ...prefix("runs", [
          index("routes/run/index.tsx"),
          route("create/:apiUrlEncoded", "routes/run/create.tsx"),
          route("show/:apiUrlEncoded", "routes/run/show.tsx"),
          route("list/:apiUrlEncoded", "routes/run/list.tsx"),
          route("edit/:apiUrlEncoded", "routes/run/edit.tsx"),
          route("add-item/:apiUrlEncoded", "routes/run/add-item.tsx"),
        ]),
      ]),
    ]),
  ]),
  // Legacy URLs without a locale prefix: redirect to the detected locale
  route("*", "routes/locale-redirect.tsx", { id: "locale-splat" }),
] satisfies RouteConfig;
