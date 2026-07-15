import { z } from 'zod';

// Response shapes mirror the Daybook content API delivery routes. zod does
// double duty: it types the data AND validates it at the fetch boundary, so a
// CRM-side API change surfaces as a loud parse error instead of a silent
// undefined deep in a template. Unknown keys are stripped (zod default), so the
// site only ever sees the documented surface.

/** A sibling-locale pointer for hreflang / language switchers. */
export const localeRefSchema = z.object({
  locale: z.string(),
  slug: z.string(),
});
export type LocaleRef = z.infer<typeof localeRefSchema>;

/** Blog post as returned by the list endpoint (no body). */
export const postSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  locale: z.string(),
  published_at: z.string(),
  hero_image_url: z.string().nullable(),
});
export type PostSummary = z.infer<typeof postSummarySchema>;

/** Full blog post (both body forms + sibling locales). */
export const postSchema = postSummarySchema.extend({
  body_html: z.string(),
  body_json: z.unknown(),
  updated_at: z.string(),
  translations: z.array(localeRefSchema),
});
export type Post = z.infer<typeof postSchema>;

/** Gallery as returned by the list endpoint (cover only). */
export const gallerySummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  locale: z.string(),
  hero_image_url: z.string().nullable(),
});
export type GallerySummary = z.infer<typeof gallerySummarySchema>;

/** One photo within a gallery, caption resolved to the requested locale. */
export const galleryPhotoSchema = z.object({
  id: z.string(),
  url: z.string().nullable(),
  caption: z.string().nullable(),
});
export type GalleryPhoto = z.infer<typeof galleryPhotoSchema>;

/** Full gallery (description, ordered photos, sibling locales). */
export const gallerySchema = z.object({
  id: z.string(),
  slug: z.string(),
  locale: z.string(),
  name: z.string(),
  description_html: z.string().nullable(),
  description_json: z.unknown(),
  hero_image_url: z.string().nullable(),
  photos: z.array(galleryPhotoSchema),
  translations: z.array(localeRefSchema),
});
export type Gallery = z.infer<typeof gallerySchema>;

/** A content block, resolved to the served locale (may be the en fallback). */
export const contentBlockSchema = z.object({
  html: z.string(),
  json: z.unknown(),
  locale: z.string(),
});
export type ContentBlock = z.infer<typeof contentBlockSchema>;

// --- Response envelopes ---

export const postsResponseSchema = z.object({
  posts: z.array(postSummarySchema),
  locale: z.string(),
});
export const postResponseSchema = z.object({ post: postSchema });
export const galleriesResponseSchema = z.object({
  galleries: z.array(gallerySummarySchema),
  locale: z.string(),
});
export const galleryResponseSchema = z.object({ gallery: gallerySchema });
export const blocksResponseSchema = z.object({
  blocks: z.record(z.string(), contentBlockSchema),
  locale: z.string(),
});
