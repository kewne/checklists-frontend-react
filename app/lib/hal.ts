export interface HalLink {
  href: string;
  templated?: boolean;
  type?: string;
  name?: string;
  title?: string;
}

export interface HalDocument {
  _links?: Record<string, HalLink | HalLink[]>;
  [key: string]: unknown;
}

export class Resource<T extends Record<string, unknown>> {
  private readonly doc: HalDocument;

  constructor(doc: HalDocument) {
    this.doc = doc;
  }

  getLink(rel: string): HalLink | HalLink[] | undefined {
    return this.doc._links?.[rel];
  }

  getLinkArray(rel: string): HalLink[] {
    const link = this.doc._links?.[rel];
    if (!link) return [];
    return Array.isArray(link) ? link : [link];
  }

  getNamedLink(rel: string, name: string): HalLink | undefined {
    return this.getLinkArray(rel).find((l) => l.name === name);
  }

  get properties(): T {
    const { _links, ...rest } = this.doc;
    return rest as T;
  }
}
