import { postsResponseSchema, postResponseSchema, galleriesResponseSchema, galleryResponseSchema, blocksResponseSchema, } from './types.js';
class NotFound {
}
const NOT_FOUND = new NotFound();
export function createClient(config) {
    const base = config.contentApiUrl.replace(/\/+$/, '');
    const defaultLocale = config.defaultLocale ?? 'en';
    const doFetch = config.fetch ?? globalThis.fetch;
    const report = config.onError ??
        ((e) => console.error(`[daybook] ${e.scope}: ${e.message}`, e.cause ?? ''));
    if (!config.contentApiUrl || !config.token) {
        report({ scope: 'config', message: 'Missing contentApiUrl or token' });
    }
    const get = async (scope, path, schema, params) => {
        const url = new URL(`${base}/${path}`);
        for (const [k, v] of Object.entries(params))
            url.searchParams.set(k, v);
        let res;
        try {
            res = await doFetch(url.toString(), { headers: { authorization: `Bearer ${config.token}` } });
        }
        catch (cause) {
            report({ scope, message: 'network error', cause });
            throw cause;
        }
        if (res.status === 404)
            return NOT_FOUND;
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
    const loc = (opts) => opts?.locale ?? defaultLocale;
    const api = {
        async blocks(opts) {
            try {
                const r = await get('blocks', 'blocks', blocksResponseSchema, { locale: loc(opts) });
                return r instanceof NotFound ? {} : r.blocks;
            }
            catch {
                return {};
            }
        },
        async block(key, opts) {
            const all = await api.blocks(opts);
            return all[key] ?? null;
        },
        async posts(opts) {
            const params = { locale: loc(opts) };
            if (opts?.limit != null)
                params.limit = String(opts.limit);
            if (opts?.offset != null)
                params.offset = String(opts.offset);
            try {
                const r = await get('posts', 'posts', postsResponseSchema, params);
                return r instanceof NotFound ? [] : r.posts;
            }
            catch {
                return [];
            }
        },
        async post(slug, opts) {
            try {
                const r = await get('post', `posts/${encodeURIComponent(slug)}`, postResponseSchema, {
                    locale: loc(opts),
                });
                return r instanceof NotFound ? null : r.post;
            }
            catch {
                return null;
            }
        },
        async galleries(opts) {
            try {
                const r = await get('galleries', 'galleries', galleriesResponseSchema, { locale: loc(opts) });
                return r instanceof NotFound ? [] : r.galleries;
            }
            catch {
                return [];
            }
        },
        async gallery(slug, opts) {
            try {
                const r = await get('gallery', `galleries/${encodeURIComponent(slug)}`, galleryResponseSchema, {
                    locale: loc(opts),
                });
                return r instanceof NotFound ? null : r.gallery;
            }
            catch {
                return null;
            }
        },
    };
    return api;
}
