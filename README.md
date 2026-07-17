# @wiest-digital/daybook-client

Client SDK for the **Daybook** content API. Everything a website needs to pull
Daybook-managed content and send leads back, so we stop re-carving the same
fetch/auth/types/CSS on every client site.

Framework-agnostic (pure `fetch` + types + a plain stylesheet). Works in Astro,
Next, or anything with `fetch`. It is **plumbing, not UI** — it hands you clean,
typed, validated data; you own the design.

## What's in the box

- **`createClient`** — typed getters for content blocks, blog posts, and
  galleries, with Bearer auth, locale handling, response validation (zod), and a
  graceful-degradation contract (lists → `[]`, items → `null` on failure, so a
  page never crashes).
- **`submitLead`** — server-side lead submission to the ingest endpoint (JSON or
  multipart-with-photos), with the token + source URL owned server-side.
- **`prose.css`** — the canonical stylesheet for CMS-delivered HTML. Restores the
  block-node structure resets strip (heading sizes, list markers, blockquotes),
  inheriting each site's font and color.

## Install

```bash
npm i @wiest-digital/daybook-client
```

Or without npm, straight from the repo: `npm i github:Wiest-Digital/daybook-client#v0.1.1`.

## Content

```ts
import { createClient } from '@wiest-digital/daybook-client';

const daybook = createClient({
  contentApiUrl: import.meta.env.CONTENT_API_URL, // https://.../api/content
  token: import.meta.env.CONTENT_API_TOKEN,
  defaultLocale: 'en',
});

const posts = await daybook.posts();               // PostSummary[]
const post = await daybook.post('my-slug');        // Post | null
const galleries = await daybook.galleries();       // GallerySummary[]
const gallery = await daybook.gallery('brick');    // Gallery | null
const blocks = await daybook.blocks();             // Record<key, ContentBlock>
const banner = await daybook.block('sale-banner'); // ContentBlock | null
```

Render the sanitized HTML into a `.daybook-prose` element:

```astro
---
import '@wiest-digital/daybook-client/prose.css';
const post = await daybook.post(Astro.params.slug);
---
{post && <div class="daybook-prose" set:html={post.body_html} />}
```

Failures are logged (override with `onError`) and return the safe empty value —
so a missing block or a down API degrades gracefully instead of 500-ing.

## Leads

Call server-side (an API route / action), never from the browser:

```ts
import { submitLead } from '@wiest-digital/daybook-client';

// Simple JSON form:
await submitLead(
  { ingestUrl: import.meta.env.CRM_INGEST_URL, ingestToken: import.meta.env.CRM_INGEST_TOKEN },
  { fields: { name, email, phone, message }, sourceUrl: request.headers.get('referer') ?? undefined }
);

// Multipart pass-through (photo uploads) — forward the inbound FormData:
await submitLead(config, { form: await request.formData(), sourceUrl: referer });
```

## New-site checklist

> Site/developer side only. The full operator runbook — create the tenant in the
> CRM admin, wire domains + tokens, enable content features, go live — is
> `docs/onboard-new-tenant.md` in the `wiest-digital-crm` repo.

1. `npm i @wiest-digital/daybook-client` (or `github:Wiest-Digital/daybook-client#v0.1.1` without npm).
2. Set env vars in the Vercel project (**Production** scope; preview won't have them):
   - `CONTENT_API_URL` — `https://<tenant-dashboard>/api/content`
   - `CONTENT_API_TOKEN` — the tenant's content token (from the CRM admin → client)
   - `CRM_INGEST_URL` / `CRM_INGEST_TOKEN` — if the site captures leads
3. `createClient(...)` once; call the getters in your pages (SSR / `prerender = false`
   or ISR so edits appear without a rebuild).
4. `import '@wiest-digital/daybook-client/prose.css'` once; add `class="daybook-prose"`
   wherever you `set:html` CMS content. Layer brand tweaks on top.
5. Route the contact form through `submitLead` server-side.

## Publishing to npm (first time — Derrick)

1. Create the org once (free): npmjs.com → **Add Organization** → `wiest-digital`.
   (If you pick a different name, update the `name` scope in `package.json`.)
2. `npm login` as a member of that org.
3. `npm publish` — `publishConfig.access` is already `public`; `prepublishOnly`
   rebuilds `dist`.
4. Bump each consuming site off the git dep: `npm i @wiest-digital/daybook-client@^0.1.1`.

## Develop

```bash
npm install
npm run build      # tsc -> dist/ (committed so the git dep needs no build step)
npm test           # vitest
```

`dist/` is committed on purpose: it lets sites install this straight from GitHub
(no build step at install time) before it's on npm.

License: UNLICENSED (proprietary; source-available for our own sites).
