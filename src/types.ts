export interface Feed {
  title: string;
  link: string;
}

export interface FeedFinderOptions {
  /** HTTP proxy URL for requests */
  requestProxy?: string;
  /** Request timeout in milliseconds (default: 60000) */
  timeout?: number;
  /** Custom User-Agent header */
  userAgent?: string;
  /** Additional HTTP headers */
  headers?: Record<string, string>;
}

export interface ServiceMatcher {
  match(url: URL): boolean;
  getFeeds(url: URL, options: FeedFinderOptions): Promise<Feed[]>;
}
