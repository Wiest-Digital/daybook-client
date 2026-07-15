import { describe, it, expect, vi } from 'vitest';
import { submitLead, type LeadConfig } from './lead.js';

describe('submitLead', () => {
  const INGEST_URL = 'https://dashboard.example.com/api/leads/ingest';
  const INGEST_TOKEN = 'ingest-secret-token-32chars-minimum';

  const mockFetch = (status: number, bodyText = ''): typeof fetch => {
    return vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      text: async () => bodyText,
    })) as unknown as typeof fetch;
  };

  const mockFetchThrow = (err: Error): typeof fetch => {
    return vi.fn(async () => {
      throw err;
    }) as unknown as typeof fetch;
  };

  describe('JSON fields input', () => {
    it('POSTs JSON with content-type: application/json', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => '',
      })) as unknown as typeof fetch;

      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: fakeFetch,
      };

      await submitLead(config, { fields: { email: 'user@example.com', name: 'Alice' } });

      expect(fakeFetch).toHaveBeenCalledWith(
        INGEST_URL,
        expect.objectContaining({
          method: 'POST',
          headers: { 'content-type': 'application/json' },
        })
      );
    });

    it('includes fields plus server-set ingest_token', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => '',
      })) as unknown as typeof fetch;

      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: fakeFetch,
      };

      await submitLead(config, { fields: { email: 'user@example.com' } });

      const call = fakeFetch.mock.calls[0] as [string, { body?: string }];
      const body = JSON.parse(call[1].body ?? '{}');
      expect(body).toEqual({
        email: 'user@example.com',
        ingest_token: INGEST_TOKEN,
      });
    });

    it('strips client-supplied ingest_token and replaces with config token', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => '',
      })) as unknown as typeof fetch;

      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: fakeFetch,
      };

      await submitLead(config, {
        fields: { email: 'user@example.com', ingest_token: 'FORGED' },
      });

      const call = fakeFetch.mock.calls[0] as [string, { body?: string }];
      const body = JSON.parse(call[1].body ?? '{}');
      expect(body.ingest_token).toBe(INGEST_TOKEN);
      expect(body.ingest_token).not.toBe('FORGED');
    });

    it('strips client-supplied source_url and replaces with arg sourceUrl', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => '',
      })) as unknown as typeof fetch;

      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: fakeFetch,
      };

      await submitLead(config, {
        fields: { email: 'user@example.com', source_url: 'https://evil.com' },
        sourceUrl: 'https://legit.com/contact',
      });

      const call = fakeFetch.mock.calls[0] as [string, { body?: string }];
      const body = JSON.parse(call[1].body ?? '{}');
      expect(body.source_url).toBe('https://legit.com/contact');
      expect(body.source_url).not.toBe('https://evil.com');
    });

    it('adds sourceUrl when provided', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => '',
      })) as unknown as typeof fetch;

      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: fakeFetch,
      };

      await submitLead(config, {
        fields: { email: 'user@example.com' },
        sourceUrl: 'https://example.com/contact',
      });

      const call = fakeFetch.mock.calls[0] as [string, { body?: string }];
      const body = JSON.parse(call[1].body ?? '{}');
      expect(body.source_url).toBe('https://example.com/contact');
    });

    it('omits source_url when not provided', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => '',
      })) as unknown as typeof fetch;

      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: fakeFetch,
      };

      await submitLead(config, { fields: { email: 'user@example.com' } });

      const call = fakeFetch.mock.calls[0] as [string, { body?: string }];
      const body = JSON.parse(call[1].body ?? '{}');
      expect(body).not.toHaveProperty('source_url');
    });
  });

  describe('FormData input', () => {
    it('POSTs FormData as multipart (no explicit content-type header)', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => '',
      })) as unknown as typeof fetch;

      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: fakeFetch,
      };

      const form = new FormData();
      form.set('email', 'user@example.com');

      await submitLead(config, { form });

      const call = fakeFetch.mock.calls[0] as [string, { body?: FormData; headers?: Record<string, string> }];
      expect(call[1].body).toBeInstanceOf(FormData);
      expect(call[1].headers).toEqual({});
    });

    it('strips owned keys from FormData and sets config values', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => '',
      })) as unknown as typeof fetch;

      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: fakeFetch,
      };

      const form = new FormData();
      form.set('email', 'user@example.com');
      form.set('ingest_token', 'FORGED');
      form.set('source_url', 'https://evil.com');

      await submitLead(config, { form, sourceUrl: 'https://legit.com' });

      const call = fakeFetch.mock.calls[0] as [string, { body?: FormData }];
      const sentForm = call[1].body as FormData;

      expect(sentForm.get('email')).toBe('user@example.com');
      expect(sentForm.get('ingest_token')).toBe(INGEST_TOKEN);
      expect(sentForm.get('source_url')).toBe('https://legit.com');
    });

    it('preserves non-owned FormData fields', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => '',
      })) as unknown as typeof fetch;

      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: fakeFetch,
      };

      const form = new FormData();
      form.set('email', 'user@example.com');
      form.set('name', 'Alice');
      form.set('message', 'Hello world');

      await submitLead(config, { form });

      const call = fakeFetch.mock.calls[0] as [string, { body?: FormData }];
      const sentForm = call[1].body as FormData;

      expect(sentForm.get('email')).toBe('user@example.com');
      expect(sentForm.get('name')).toBe('Alice');
      expect(sentForm.get('message')).toBe('Hello world');
    });

    it('adds sourceUrl to FormData when provided', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => '',
      })) as unknown as typeof fetch;

      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: fakeFetch,
      };

      const form = new FormData();
      form.set('email', 'user@example.com');

      await submitLead(config, { form, sourceUrl: 'https://example.com/form' });

      const call = fakeFetch.mock.calls[0] as [string, { body?: FormData }];
      const sentForm = call[1].body as FormData;
      expect(sentForm.get('source_url')).toBe('https://example.com/form');
    });

    it('does not add source_url to FormData when not provided', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => '',
      })) as unknown as typeof fetch;

      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: fakeFetch,
      };

      const form = new FormData();
      form.set('email', 'user@example.com');

      await submitLead(config, { form });

      const call = fakeFetch.mock.calls[0] as [string, { body?: FormData }];
      const sentForm = call[1].body as FormData;
      expect(sentForm.has('source_url')).toBe(false);
    });
  });

  describe('success result', () => {
    it('returns { ok: true, status } on 2xx response', async () => {
      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: mockFetch(201, ''),
      };

      const result = await submitLead(config, { fields: { email: 'user@example.com' } });
      expect(result).toEqual({ ok: true, status: 201 });
    });

    it('returns { ok: true, status: 200 } on 200 OK', async () => {
      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: mockFetch(200, 'Lead created'),
      };

      const result = await submitLead(config, { fields: { email: 'user@example.com' } });
      expect(result).toEqual({ ok: true, status: 200 });
    });
  });

  describe('failure results', () => {
    it('returns { ok: false, status, error } on non-ok response', async () => {
      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: mockFetch(400, 'Invalid email'),
      };

      const result = await submitLead(config, { fields: { email: 'bad' } });
      expect(result).toEqual({ ok: false, status: 400, error: 'Invalid email' });
    });

    it('returns { ok: false, status, error } with fallback message when body is empty', async () => {
      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: mockFetch(500, ''),
      };

      const result = await submitLead(config, { fields: { email: 'user@example.com' } });
      expect(result).toEqual({ ok: false, status: 500, error: 'ingest 500' });
    });

    it('returns { ok: false, status: 0, error } when fetch throws', async () => {
      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: mockFetchThrow(new Error('Network timeout')),
      };

      const result = await submitLead(config, { fields: { email: 'user@example.com' } });
      expect(result).toEqual({ ok: false, status: 0, error: 'Network timeout' });
    });

    it('returns { ok: false, status: 0, error } when fetch throws non-Error', async () => {
      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: mockFetchThrow('String error' as unknown as Error),
      };

      const result = await submitLead(config, { fields: { email: 'user@example.com' } });
      expect(result).toEqual({ ok: false, status: 0, error: 'String error' });
    });

    it('handles non-2xx with text() throwing', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: false,
        status: 502,
        text: async () => {
          throw new Error('Body read failed');
        },
      })) as unknown as typeof fetch;

      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: fakeFetch,
      };

      const result = await submitLead(config, { fields: { email: 'user@example.com' } });
      expect(result).toEqual({ ok: false, status: 502, error: 'ingest 502' });
    });
  });

  describe('edge cases', () => {
    it('handles empty fields object', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => '',
      })) as unknown as typeof fetch;

      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: fakeFetch,
      };

      await submitLead(config, { fields: {} });

      const call = fakeFetch.mock.calls[0] as [string, { body?: string }];
      const body = JSON.parse(call[1].body ?? '{}');
      expect(body).toEqual({ ingest_token: INGEST_TOKEN });
    });

    it('handles empty FormData', async () => {
      const fakeFetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => '',
      })) as unknown as typeof fetch;

      const config: LeadConfig = {
        ingestUrl: INGEST_URL,
        ingestToken: INGEST_TOKEN,
        fetch: fakeFetch,
      };

      const form = new FormData();
      await submitLead(config, { form });

      const call = fakeFetch.mock.calls[0] as [string, { body?: FormData }];
      const sentForm = call[1].body as FormData;
      expect(sentForm.get('ingest_token')).toBe(INGEST_TOKEN);
    });
  });
});
