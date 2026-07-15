import { type PostSummary, type Post, type GallerySummary, type Gallery, type ContentBlock } from './types.js';
/** A failure fetching or validating content. Passed to `onError`. */
export type DaybookError = {
    /** Which call failed, e.g. `posts`, `post`, `galleries`, `blocks`. */
    scope: string;
    /** HTTP status, when the request completed. */
    status?: number;
    message: string;
    cause?: unknown;
};
export type DaybookClientConfig = {
    /** Base content API URL, e.g. `https://dashboard.example.com/api/content`. */
    contentApiUrl: string;
    /** The tenant's content token (sent as a Bearer credential). */
    token: string;
    /** Locale used when a call doesn't specify one. Defaults to `en`. */
    defaultLocale?: string;
    /** `fetch` implementation (defaults to the global). Handy for tests. */
    fetch?: typeof fetch;
    /**
     * Called on any fetch/validation failure. Content getters still return a
     * safe empty value so a page never crashes — this is the observability hook.
     * Defaults to `console.error`.
     */
    onError?: (error: DaybookError) => void;
};
type LocaleOpts = {
    locale?: string;
};
type ListOpts = LocaleOpts & {
    limit?: number;
    offset?: number;
};
export type DaybookClient = {
    /** All content blocks for the tenant, keyed by block key. `{}` on failure. */
    blocks(opts?: LocaleOpts): Promise<Record<string, ContentBlock>>;
    /** One content block by key, or `null` if absent. */
    block(key: string, opts?: LocaleOpts): Promise<ContentBlock | null>;
    /** Published posts, newest first. `[]` on failure. */
    posts(opts?: ListOpts): Promise<PostSummary[]>;
    /** One post by slug with its body, or `null` if not found. */
    post(slug: string, opts?: LocaleOpts): Promise<Post | null>;
    /** Published galleries in the tenant's order. `[]` on failure. */
    galleries(opts?: LocaleOpts): Promise<GallerySummary[]>;
    /** One gallery by slug with its photos, or `null` if not found. */
    gallery(slug: string, opts?: LocaleOpts): Promise<Gallery | null>;
};
export declare function createClient(config: DaybookClientConfig): DaybookClient;
export {};
