import { encodeApiUrl } from "./encoding";
import type { Resource } from "./hal";

export interface UpLinkDefinition {
  labelKey: string;
  to: string;
}

export type UpLinkFactory<T> = (data: T) => UpLinkDefinition | undefined;

export interface RouteHandle<T = unknown> {
  up?: UpLinkDefinition | UpLinkFactory<T>;
}

export function resourceUpLink(
  resource: Resource,
  routePattern: string,
  labelKey: string,
): UpLinkDefinition | undefined {
  const up = resource.getFirstLinkMatching("up");
  if (!up) {
    return undefined;
  }
  return {
    labelKey,
    to: `${routePattern}/${encodeApiUrl(up.href)}`,
  };
}
