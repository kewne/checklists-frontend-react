import { useMatches } from "react-router";
import { useTranslation } from "react-i18next";
import type {
  HeadingDefinition,
  HeadingDefinitionOrString,
  RouteHandle,
} from "./routeHandle";

interface MatchWithHandle {
  id: string;
  loaderData: unknown;
  handle: RouteHandle;
}

function resolveHeadingDefinitionOrString(
  heading: HeadingDefinitionOrString | undefined,
): HeadingDefinition | string | undefined {
  return heading;
}

export function useRouteHeading(): string | undefined {
  const matches = useMatches() as MatchWithHandle[];
  const { t } = useTranslation();

  const matchWithHeading = [...matches]
    .reverse()
    .find((match) => match.handle?.heading !== undefined);

  if (!matchWithHeading) {
    return undefined;
  }

  const heading = matchWithHeading.handle.heading;
  const resolved: HeadingDefinitionOrString | undefined =
    typeof heading === "function"
      ? heading(matchWithHeading.loaderData)
      : resolveHeadingDefinitionOrString(heading);

  if (resolved === undefined) {
    return undefined;
  }

  if (typeof resolved === "string") {
    return resolved;
  }

  return t(resolved.labelKey, resolved.values ?? {});
}
