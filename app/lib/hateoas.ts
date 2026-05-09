import type { User } from "firebase/auth";
import { apiResourceActions } from "./api";
import type { HalLink, Resource } from "./hal";

export function createFrom(
  resource: Resource,
  user: User,
  filter?: (link: HalLink) => boolean,
) {
  const link = resource.getFirstLinkMatching("create-from", filter);
  if (!link) {
    return;
  }
  const { post } = apiResourceActions<{ title: string }>(link.href, user);
  return post;
}

export function updateFrom(
  resource: Resource,
  user: User,
  filter?: (link: HalLink) => boolean,
) {
  const link = resource.getFirstLinkMatching("update-from", filter);
  if (!link) {
    return;
  }
  const { post } = apiResourceActions<void>(link.href, user);
  return post;
}
