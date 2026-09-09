import { encodeApiUrl } from "./encoding";
import type { Resource } from "./hal";

export interface UpLinkDefinition {
  labelKey: string;
  to: string;
}

export type UpLinkFactory<T> = (data: T) => UpLinkDefinition | undefined;

export interface HeadingDefinition {
  labelKey: string;
  values?: Record<string, unknown>;
}

export type HeadingDefinitionOrString = HeadingDefinition | string;

export type HeadingFactory<T> = (
  data: T,
) => HeadingDefinitionOrString | undefined;

export interface RouteHandle<T = unknown> {
  up?: UpLinkDefinition | UpLinkFactory<T>;
  heading?: HeadingDefinitionOrString | HeadingFactory<T>;
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

export function resourceHeading<T extends Record<string, unknown>>(
  resource: Resource<T>,
  propertyName: keyof T,
): string | undefined {
  const value = resource.properties[propertyName];
  if (typeof value === "string") {
    return value;
  }
  return undefined;
}
