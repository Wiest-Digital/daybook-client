import { z } from 'zod';
/** A sibling-locale pointer for hreflang / language switchers. */
export declare const localeRefSchema: z.ZodObject<{
    locale: z.ZodString;
    slug: z.ZodString;
}, "strip", z.ZodTypeAny, {
    locale: string;
    slug: string;
}, {
    locale: string;
    slug: string;
}>;
export type LocaleRef = z.infer<typeof localeRefSchema>;
/** Blog post as returned by the list endpoint (no body). */
export declare const postSummarySchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    title: z.ZodString;
    excerpt: z.ZodNullable<z.ZodString>;
    locale: z.ZodString;
    published_at: z.ZodString;
    hero_image_url: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    locale: string;
    slug: string;
    id: string;
    title: string;
    excerpt: string | null;
    published_at: string;
    hero_image_url: string | null;
}, {
    locale: string;
    slug: string;
    id: string;
    title: string;
    excerpt: string | null;
    published_at: string;
    hero_image_url: string | null;
}>;
export type PostSummary = z.infer<typeof postSummarySchema>;
/** Full blog post (both body forms + sibling locales). */
export declare const postSchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    title: z.ZodString;
    excerpt: z.ZodNullable<z.ZodString>;
    locale: z.ZodString;
    published_at: z.ZodString;
    hero_image_url: z.ZodNullable<z.ZodString>;
} & {
    body_html: z.ZodString;
    body_json: z.ZodUnknown;
    updated_at: z.ZodString;
    translations: z.ZodArray<z.ZodObject<{
        locale: z.ZodString;
        slug: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        locale: string;
        slug: string;
    }, {
        locale: string;
        slug: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    locale: string;
    slug: string;
    id: string;
    title: string;
    excerpt: string | null;
    published_at: string;
    hero_image_url: string | null;
    body_html: string;
    updated_at: string;
    translations: {
        locale: string;
        slug: string;
    }[];
    body_json?: unknown;
}, {
    locale: string;
    slug: string;
    id: string;
    title: string;
    excerpt: string | null;
    published_at: string;
    hero_image_url: string | null;
    body_html: string;
    updated_at: string;
    translations: {
        locale: string;
        slug: string;
    }[];
    body_json?: unknown;
}>;
export type Post = z.infer<typeof postSchema>;
/** Gallery as returned by the list endpoint (cover only). */
export declare const gallerySummarySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    locale: z.ZodString;
    hero_image_url: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    locale: string;
    slug: string;
    id: string;
    hero_image_url: string | null;
    name: string;
}, {
    locale: string;
    slug: string;
    id: string;
    hero_image_url: string | null;
    name: string;
}>;
export type GallerySummary = z.infer<typeof gallerySummarySchema>;
/** One photo within a gallery, caption resolved to the requested locale. */
export declare const galleryPhotoSchema: z.ZodObject<{
    id: z.ZodString;
    url: z.ZodNullable<z.ZodString>;
    caption: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    url: string | null;
    caption: string | null;
}, {
    id: string;
    url: string | null;
    caption: string | null;
}>;
export type GalleryPhoto = z.infer<typeof galleryPhotoSchema>;
/** Full gallery (description, ordered photos, sibling locales). */
export declare const gallerySchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    locale: z.ZodString;
    name: z.ZodString;
    description_html: z.ZodNullable<z.ZodString>;
    description_json: z.ZodUnknown;
    hero_image_url: z.ZodNullable<z.ZodString>;
    photos: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        url: z.ZodNullable<z.ZodString>;
        caption: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        url: string | null;
        caption: string | null;
    }, {
        id: string;
        url: string | null;
        caption: string | null;
    }>, "many">;
    translations: z.ZodArray<z.ZodObject<{
        locale: z.ZodString;
        slug: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        locale: string;
        slug: string;
    }, {
        locale: string;
        slug: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    locale: string;
    slug: string;
    id: string;
    hero_image_url: string | null;
    translations: {
        locale: string;
        slug: string;
    }[];
    name: string;
    description_html: string | null;
    photos: {
        id: string;
        url: string | null;
        caption: string | null;
    }[];
    description_json?: unknown;
}, {
    locale: string;
    slug: string;
    id: string;
    hero_image_url: string | null;
    translations: {
        locale: string;
        slug: string;
    }[];
    name: string;
    description_html: string | null;
    photos: {
        id: string;
        url: string | null;
        caption: string | null;
    }[];
    description_json?: unknown;
}>;
export type Gallery = z.infer<typeof gallerySchema>;
/** A content block, resolved to the served locale (may be the en fallback). */
export declare const contentBlockSchema: z.ZodObject<{
    html: z.ZodString;
    json: z.ZodUnknown;
    locale: z.ZodString;
}, "strip", z.ZodTypeAny, {
    locale: string;
    html: string;
    json?: unknown;
}, {
    locale: string;
    html: string;
    json?: unknown;
}>;
export type ContentBlock = z.infer<typeof contentBlockSchema>;
export declare const postsResponseSchema: z.ZodObject<{
    posts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        slug: z.ZodString;
        title: z.ZodString;
        excerpt: z.ZodNullable<z.ZodString>;
        locale: z.ZodString;
        published_at: z.ZodString;
        hero_image_url: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        locale: string;
        slug: string;
        id: string;
        title: string;
        excerpt: string | null;
        published_at: string;
        hero_image_url: string | null;
    }, {
        locale: string;
        slug: string;
        id: string;
        title: string;
        excerpt: string | null;
        published_at: string;
        hero_image_url: string | null;
    }>, "many">;
    locale: z.ZodString;
}, "strip", z.ZodTypeAny, {
    locale: string;
    posts: {
        locale: string;
        slug: string;
        id: string;
        title: string;
        excerpt: string | null;
        published_at: string;
        hero_image_url: string | null;
    }[];
}, {
    locale: string;
    posts: {
        locale: string;
        slug: string;
        id: string;
        title: string;
        excerpt: string | null;
        published_at: string;
        hero_image_url: string | null;
    }[];
}>;
export declare const postResponseSchema: z.ZodObject<{
    post: z.ZodObject<{
        id: z.ZodString;
        slug: z.ZodString;
        title: z.ZodString;
        excerpt: z.ZodNullable<z.ZodString>;
        locale: z.ZodString;
        published_at: z.ZodString;
        hero_image_url: z.ZodNullable<z.ZodString>;
    } & {
        body_html: z.ZodString;
        body_json: z.ZodUnknown;
        updated_at: z.ZodString;
        translations: z.ZodArray<z.ZodObject<{
            locale: z.ZodString;
            slug: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            locale: string;
            slug: string;
        }, {
            locale: string;
            slug: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        locale: string;
        slug: string;
        id: string;
        title: string;
        excerpt: string | null;
        published_at: string;
        hero_image_url: string | null;
        body_html: string;
        updated_at: string;
        translations: {
            locale: string;
            slug: string;
        }[];
        body_json?: unknown;
    }, {
        locale: string;
        slug: string;
        id: string;
        title: string;
        excerpt: string | null;
        published_at: string;
        hero_image_url: string | null;
        body_html: string;
        updated_at: string;
        translations: {
            locale: string;
            slug: string;
        }[];
        body_json?: unknown;
    }>;
}, "strip", z.ZodTypeAny, {
    post: {
        locale: string;
        slug: string;
        id: string;
        title: string;
        excerpt: string | null;
        published_at: string;
        hero_image_url: string | null;
        body_html: string;
        updated_at: string;
        translations: {
            locale: string;
            slug: string;
        }[];
        body_json?: unknown;
    };
}, {
    post: {
        locale: string;
        slug: string;
        id: string;
        title: string;
        excerpt: string | null;
        published_at: string;
        hero_image_url: string | null;
        body_html: string;
        updated_at: string;
        translations: {
            locale: string;
            slug: string;
        }[];
        body_json?: unknown;
    };
}>;
export declare const galleriesResponseSchema: z.ZodObject<{
    galleries: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        slug: z.ZodString;
        locale: z.ZodString;
        hero_image_url: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        locale: string;
        slug: string;
        id: string;
        hero_image_url: string | null;
        name: string;
    }, {
        locale: string;
        slug: string;
        id: string;
        hero_image_url: string | null;
        name: string;
    }>, "many">;
    locale: z.ZodString;
}, "strip", z.ZodTypeAny, {
    locale: string;
    galleries: {
        locale: string;
        slug: string;
        id: string;
        hero_image_url: string | null;
        name: string;
    }[];
}, {
    locale: string;
    galleries: {
        locale: string;
        slug: string;
        id: string;
        hero_image_url: string | null;
        name: string;
    }[];
}>;
export declare const galleryResponseSchema: z.ZodObject<{
    gallery: z.ZodObject<{
        id: z.ZodString;
        slug: z.ZodString;
        locale: z.ZodString;
        name: z.ZodString;
        description_html: z.ZodNullable<z.ZodString>;
        description_json: z.ZodUnknown;
        hero_image_url: z.ZodNullable<z.ZodString>;
        photos: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            url: z.ZodNullable<z.ZodString>;
            caption: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            url: string | null;
            caption: string | null;
        }, {
            id: string;
            url: string | null;
            caption: string | null;
        }>, "many">;
        translations: z.ZodArray<z.ZodObject<{
            locale: z.ZodString;
            slug: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            locale: string;
            slug: string;
        }, {
            locale: string;
            slug: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        locale: string;
        slug: string;
        id: string;
        hero_image_url: string | null;
        translations: {
            locale: string;
            slug: string;
        }[];
        name: string;
        description_html: string | null;
        photos: {
            id: string;
            url: string | null;
            caption: string | null;
        }[];
        description_json?: unknown;
    }, {
        locale: string;
        slug: string;
        id: string;
        hero_image_url: string | null;
        translations: {
            locale: string;
            slug: string;
        }[];
        name: string;
        description_html: string | null;
        photos: {
            id: string;
            url: string | null;
            caption: string | null;
        }[];
        description_json?: unknown;
    }>;
}, "strip", z.ZodTypeAny, {
    gallery: {
        locale: string;
        slug: string;
        id: string;
        hero_image_url: string | null;
        translations: {
            locale: string;
            slug: string;
        }[];
        name: string;
        description_html: string | null;
        photos: {
            id: string;
            url: string | null;
            caption: string | null;
        }[];
        description_json?: unknown;
    };
}, {
    gallery: {
        locale: string;
        slug: string;
        id: string;
        hero_image_url: string | null;
        translations: {
            locale: string;
            slug: string;
        }[];
        name: string;
        description_html: string | null;
        photos: {
            id: string;
            url: string | null;
            caption: string | null;
        }[];
        description_json?: unknown;
    };
}>;
export declare const blocksResponseSchema: z.ZodObject<{
    blocks: z.ZodRecord<z.ZodString, z.ZodObject<{
        html: z.ZodString;
        json: z.ZodUnknown;
        locale: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        locale: string;
        html: string;
        json?: unknown;
    }, {
        locale: string;
        html: string;
        json?: unknown;
    }>>;
    locale: z.ZodString;
}, "strip", z.ZodTypeAny, {
    locale: string;
    blocks: Record<string, {
        locale: string;
        html: string;
        json?: unknown;
    }>;
}, {
    locale: string;
    blocks: Record<string, {
        locale: string;
        html: string;
        json?: unknown;
    }>;
}>;
