export interface HalLink {
  href: string;
  templated?: boolean;
  type?: string;
  name?: string;
  title?: string;
}

export interface HalDocument {
  _links?: Record<string, HalLink | HalLink[]>;
  _nested?: Record<string, HalDocument[]>;
  [key: string]: unknown;
}

export type JsonProperties = Record<string, unknown>

export class Resource<T extends JsonProperties = {}> {
  protected readonly doc: HalDocument;

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

  getFirstLinkMatching(rel: string, filter?: (link: HalLink) => boolean): HalLink | undefined {
    const links = this.getLinkArray(rel);
    if (!filter) {
      return links[0];
    }
    return links.find(filter);
  }

  getNested<N extends JsonProperties = {}>(key: string): Resource<N>[] {
    const nested = this.doc._nested?.[key];
    if (!nested) return [];
    return nested.map((doc) => new Resource<N>(doc));
  }

  get properties(): T {
    const { _links, _nested, ...rest } = this.doc;
    return rest as T;
  }
}
