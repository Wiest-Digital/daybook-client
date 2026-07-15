import type { ZodType } from 'zod';
import {
  postsResponseSchema,
  postResponseSchema,
  galleriesResponseSchema,
  galleryResponseSchema,
  blocksResponseSchema,
  type PostSummary,
  type Post,
  type GallerySummary,
  type Gallery,
  type ContentBlock,
} from './types.js';

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

type LocaleOpts = { locale?: string };
type ListOpts = LocaleOpts & { limit?: number; offset?: number };

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

class NotFound {}
const NOT_FOUND = new NotFound();

export function createClient(config: DaybookClientConfig): DaybookClient {
  const base = config.contentApiUrl.replace(/\/+$/, '');
  const defaultLocale = config.defaultLocale ?? 'en';
  const doFetch = config.fetch ?? globalThis.fetch;
  const report =
    config.onError ??
    ((e: DaybookError) => console.error(`[daybook] ${e.scope}: ${e.message}`, e.cause ?? ''));

  if (!config.contentApiUrl || !config.token) {
    report({ scope: 'config', message: 'Missing contentApiUrl or token' });
  }

  const get = async <T>(
    scope: string,
    path: string,
    schema: ZodType<T>,
    params: Record<string, string>
  ): Promise<T | NotFound> => {
    const url = new URL(`${base}/${path}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    let res: Response;
    try {
      res = await doFetch(url.toString(), { headers: { authorization: `Bearer ${config.token}` } });
    } catch (cause) {
      report({ scope, message: 'network error', cause });
      throw cause;
    }
    if (res.status === 404) return NOT_FOUND;
    if (!res.ok) {
      report({ scope, status: res.status, message: `content api ${res.status}` });
      throw new Error(`content api ${res.status}`);
    }
    const parsed = schema.safeParse(await res.json());
    if (!parsed.success) {
      report({ scope, status: res.status, message: 'unexpected response shape', cause: parsed.error });
      throw parsed.error;
    }
    return parsed.data;
  };

  const loc = (opts?: LocaleOpts) => opts?.locale ?? defaultLocale;

  const api: DaybookClient = {
    async blocks(opts) {
      try {
        const r = await get('blocks', 'blocks', blocksResponseSchema, { locale: loc(opts) });
        return r instanceof NotFound ? {} : r.blocks;
      } catch {
        return {};
      }
    },
    async block(key, opts) {
      const all = await api.blocks(opts);
      return all[key] ?? null;
    },
    async posts(opts) {
      const params: Record<string, string> = { locale: loc(opts) };
      if (opts?.limit != null) params.limit = String(opts.limit);
      if (opts?.offset != null) params.offset = String(opts.offset);
      try {
        const r = await get('posts', 'posts', postsResponseSchema, params);
        return r instanceof NotFound ? [] : r.posts;
      } catch {
        return [];
      }
    },
    async post(slug, opts) {
      try {
        const r = await get('post', `posts/${encodeURIComponent(slug)}`, postResponseSchema, {
          locale: loc(opts),
        });
        return r instanceof NotFound ? null : r.post;
      } catch {
        return null;
      }
    },
    async galleries(opts) {
      try {
        const r = await get('galleries', 'galleries', galleriesResponseSchema, { locale: loc(opts) });
        return r instanceof NotFound ? [] : r.galleries;
      } catch {
        return [];
      }
    },
    async gallery(slug, opts) {
      try {
        const r = await get('gallery', `galleries/${encodeURIComponent(slug)}`, galleryResponseSchema, {
          locale: loc(opts),
        });
        return r instanceof NotFound ? null : r.gallery;
      } catch {
        return null;
      }
    },
  };

  return api;
}
