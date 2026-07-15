import { describe, it, expect, vi } from 'vitest';
import { createClient, type DaybookError } from './client.js';
import type { PostSummary, Post, GallerySummary, Gallery, ContentBlock } from './types.js';

describe('createClient', () => {
  const BASE_URL = 'https://dashboard.example.com/api/content';
  const TOKEN = 'test-token-123';

  const mockFetch = (status: number, body: unknown): typeof fetch => {
    return vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      text: async () => JSON.stringify(body),
    })) as unknown as typeof fetch;
  };

  const mockFetchThrow = (err: Error): typeof fetch => {
    return vi.fn(async () => {
      throw err;
    }) as unknown as typeof fetch;
  };

  describe('URL and query construction', () => {
    it('strips trailing slashes from base URL', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ posts: [], locale: 'en' }),
        text: async () => '',
      })) as unknown as typeof fetch;

      const client = createClient({
        contentApiUrl: 'https://example.com/api/content///',
        token: TOKEN,
        fetch: fakeFetch,
      });

      await client.posts();
      expect(fakeFetch).toHaveBeenCalledWith(
        'https://example.com/api/content/posts?locale=en',
        expect.objectContaining({ headers: expect.any(Object) })
      );
    });

    it('combines limit and offset with locale via query params without double-?', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ posts: [], locale: 'fr' }),
        text: async () => '',
      })) as unknown as typeof fetch;

      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: fakeFetch,
      });

      await client.posts({ locale: 'fr', limit: 20, offset: 40 });

      const url = (fakeFetch.mock.calls[0] as [string, unknown])[0];
      expect(url).toBe('https://dashboard.example.com/api/content/posts?locale=fr&limit=20&offset=40');
      expect(url).not.toContain('??');
    });

    it('uses defaultLocale when no locale opt is passed', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ posts: [], locale: 'de' }),
        text: async () => '',
      })) as unknown as typeof fetch;

      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        defaultLocale: 'de',
        fetch: fakeFetch,
      });

      await client.posts();
      const url = (fakeFetch.mock.calls[0] as [string, unknown])[0];
      expect(url).toContain('locale=de');
    });

    it('explicit locale overrides defaultLocale', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ posts: [], locale: 'es' }),
        text: async () => '',
      })) as unknown as typeof fetch;

      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        defaultLocale: 'de',
        fetch: fakeFetch,
      });

      await client.posts({ locale: 'es' });
      const url = (fakeFetch.mock.calls[0] as [string, unknown])[0];
      expect(url).toContain('locale=es');
    });
  });

  describe('authorization header', () => {
    it('sends Bearer token in Authorization header', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ posts: [], locale: 'en' }),
        text: async () => '',
      })) as unknown as typeof fetch;

      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: fakeFetch,
      });

      await client.posts();
      expect(fakeFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { authorization: 'Bearer test-token-123' },
        })
      );
    });
  });

  describe('happy paths (200)', () => {
    it('posts() returns parsed array', async () => {
      const mockPosts: PostSummary[] = [
        {
          id: '1',
          slug: 'hello',
          title: 'Hello World',
          excerpt: 'An intro',
          locale: 'en',
          published_at: '2024-01-01',
          hero_image_url: null,
        },
      ];
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetch(200, { posts: mockPosts, locale: 'en' }),
      });

      const result = await client.posts();
      expect(result).toEqual(mockPosts);
    });

    it('post(slug) returns parsed item', async () => {
      const mockPost: Post = {
        id: '1',
        slug: 'hello',
        title: 'Hello World',
        excerpt: 'An intro',
        locale: 'en',
        published_at: '2024-01-01',
        hero_image_url: null,
        body_html: '<p>Content</p>',
        body_json: {},
        updated_at: '2024-01-02',
        translations: [],
      };
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetch(200, { post: mockPost }),
      });

      const result = await client.post('hello');
      expect(result).toEqual(mockPost);
    });

    it('galleries() returns parsed array', async () => {
      const mockGalleries: GallerySummary[] = [
        {
          id: '1',
          slug: 'vacation',
          name: 'Vacation 2024',
          locale: 'en',
          hero_image_url: null,
        },
      ];
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetch(200, { galleries: mockGalleries, locale: 'en' }),
      });

      const result = await client.galleries();
      expect(result).toEqual(mockGalleries);
    });

    it('gallery(slug) returns parsed item', async () => {
      const mockGallery: Gallery = {
        id: '1',
        slug: 'vacation',
        name: 'Vacation 2024',
        locale: 'en',
        description_html: '<p>Photos</p>',
        description_json: {},
        hero_image_url: null,
        photos: [],
        translations: [],
      };
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetch(200, { gallery: mockGallery }),
      });

      const result = await client.gallery('vacation');
      expect(result).toEqual(mockGallery);
    });

    it('blocks() returns parsed record', async () => {
      const mockBlocks: Record<string, ContentBlock> = {
        footer: { html: '<footer/>', json: {}, locale: 'en' },
      };
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetch(200, { blocks: mockBlocks, locale: 'en' }),
      });

      const result = await client.blocks();
      expect(result).toEqual(mockBlocks);
    });

    it('block(key) returns the block when present', async () => {
      const mockBlock: ContentBlock = { html: '<footer/>', json: {}, locale: 'en' };
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetch(200, { blocks: { footer: mockBlock }, locale: 'en' }),
      });

      const result = await client.block('footer');
      expect(result).toEqual(mockBlock);
    });

    it('block(key) returns null when key is absent', async () => {
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetch(200, { blocks: {}, locale: 'en' }),
      });

      const result = await client.block('missing');
      expect(result).toBeNull();
    });
  });

  describe('graceful degradation', () => {
    it('posts() returns [] on network error and calls onError', async () => {
      const onError = vi.fn();
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetchThrow(new Error('Network down')),
        onError,
      });

      const result = await client.posts();
      expect(result).toEqual([]);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          scope: 'posts',
          message: 'network error',
          cause: expect.any(Error),
        })
      );
    });

    it('posts() returns [] on non-2xx and calls onError', async () => {
      const onError = vi.fn();
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetch(500, {}),
        onError,
      });

      const result = await client.posts();
      expect(result).toEqual([]);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          scope: 'posts',
          status: 500,
          message: 'content api 500',
        })
      );
    });

    it('posts() returns [] on zod parse failure and calls onError', async () => {
      const onError = vi.fn();
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetch(200, { posts: 'invalid-shape' }),
        onError,
      });

      const result = await client.posts();
      expect(result).toEqual([]);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          scope: 'posts',
          status: 200,
          message: 'unexpected response shape',
          cause: expect.anything(),
        })
      );
    });

    it('galleries() returns [] on network error and calls onError', async () => {
      const onError = vi.fn();
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetchThrow(new Error('Timeout')),
        onError,
      });

      const result = await client.galleries();
      expect(result).toEqual([]);
      expect(onError).toHaveBeenCalled();
    });

    it('blocks() returns {} on network error and calls onError', async () => {
      const onError = vi.fn();
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetchThrow(new Error('Connection reset')),
        onError,
      });

      const result = await client.blocks();
      expect(result).toEqual({});
      expect(onError).toHaveBeenCalled();
    });

    it('post(slug) returns null on 404 WITHOUT calling onError', async () => {
      const onError = vi.fn();
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetch(404, {}),
        onError,
      });

      const result = await client.post('missing');
      expect(result).toBeNull();
      expect(onError).not.toHaveBeenCalled();
    });

    it('post(slug) returns null on non-404 error and calls onError', async () => {
      const onError = vi.fn();
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetch(500, {}),
        onError,
      });

      const result = await client.post('broken');
      expect(result).toBeNull();
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          scope: 'post',
          status: 500,
        })
      );
    });

    it('gallery(slug) returns null on 404 WITHOUT calling onError', async () => {
      const onError = vi.fn();
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetch(404, {}),
        onError,
      });

      const result = await client.gallery('missing');
      expect(result).toBeNull();
      expect(onError).not.toHaveBeenCalled();
    });

    it('gallery(slug) returns null on network error and calls onError', async () => {
      const onError = vi.fn();
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetchThrow(new Error('DNS failure')),
        onError,
      });

      const result = await client.gallery('broken');
      expect(result).toBeNull();
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('onError callback', () => {
    it('uses console.error by default', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetch(500, {}),
      });

      await client.posts();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[daybook]'),
        expect.anything()
      );
      consoleErrorSpy.mockRestore();
    });

    it('allows custom onError handler', async () => {
      const errors: DaybookError[] = [];
      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: mockFetch(403, {}),
        onError: (e) => errors.push(e),
      });

      await client.posts();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        scope: 'posts',
        status: 403,
        message: 'content api 403',
      });
    });
  });

  describe('slug encoding', () => {
    it('URL-encodes post slug', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          post: {
            id: '1',
            slug: 'hello world',
            title: 'Test',
            excerpt: null,
            locale: 'en',
            published_at: '2024-01-01',
            hero_image_url: null,
            body_html: '',
            body_json: {},
            updated_at: '2024-01-01',
            translations: [],
          },
        }),
        text: async () => '',
      })) as unknown as typeof fetch;

      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: fakeFetch,
      });

      await client.post('hello world');
      const url = (fakeFetch.mock.calls[0] as [string, unknown])[0];
      expect(url).toContain('posts/hello%20world');
    });

    it('URL-encodes gallery slug', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          gallery: {
            id: '1',
            slug: 'trip/2024',
            name: 'Trip',
            locale: 'en',
            description_html: null,
            description_json: null,
            hero_image_url: null,
            photos: [],
            translations: [],
          },
        }),
        text: async () => '',
      })) as unknown as typeof fetch;

      const client = createClient({
        contentApiUrl: BASE_URL,
        token: TOKEN,
        fetch: fakeFetch,
      });

      await client.gallery('trip/2024');
      const url = (fakeFetch.mock.calls[0] as [string, unknown])[0];
      expect(url).toContain('galleries/trip%2F2024');
    });
  });
});
