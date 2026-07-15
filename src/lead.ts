/**
 * Submit a lead to the Daybook ingest endpoint. Call this **server-side** so
 * the ingest token never reaches the browser bundle.
 *
 * Two input shapes:
 *  - `{ fields }`  — a plain object, sent as JSON (simple contact forms).
 *  - `{ form }`    — a `FormData`, forwarded as multipart (supports photo
 *                    uploads); every field passes through untouched.
 *
 * In both cases the server-owned keys (`ingest_token`, `source_url`) are
 * stripped from the caller's input and set from config, so a client can't
 * forge lead provenance or the token.
 */
export type LeadConfig = {
  /** Full ingest URL, e.g. `https://dashboard.example.com/api/leads/ingest`. */
  ingestUrl: string;
  /** The tenant's ingest token (32+ chars). Keep server-side. */
  ingestToken: string;
  /** `fetch` implementation (defaults to the global). Handy for tests. */
  fetch?: typeof fetch;
};

export type LeadResult = { ok: boolean; status: number; error?: string };

type BaseInput = {
  /** Where the lead originated (typically the request Referer). Server-trusted. */
  sourceUrl?: string;
};
export type LeadInput =
  | (BaseInput & { fields: Record<string, string>; form?: undefined })
  | (BaseInput & { form: FormData; fields?: undefined });

// Keys the server owns — a client-supplied value is dropped and replaced.
const OWNED = new Set(['ingest_token', 'source_url']);

export async function submitLead(config: LeadConfig, input: LeadInput): Promise<LeadResult> {
  const doFetch = config.fetch ?? globalThis.fetch;

  let body: BodyInit;
  let headers: Record<string, string> = {};

  if (input.form) {
    const out = new FormData();
    for (const [key, value] of input.form.entries()) {
      if (OWNED.has(key)) continue;
      out.append(key, value as string | Blob);
    }
    out.set('ingest_token', config.ingestToken);
    if (input.sourceUrl) out.set('source_url', input.sourceUrl);
    body = out; // browser/undici sets the multipart boundary content-type
  } else {
    const fields = input.fields ?? {};
    const clean: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (!OWNED.has(key)) clean[key] = value;
    }
    body = JSON.stringify({
      ...clean,
      ingest_token: config.ingestToken,
      ...(input.sourceUrl ? { source_url: input.sourceUrl } : {}),
    });
    headers = { 'content-type': 'application/json' };
  }

  try {
    const res = await doFetch(config.ingestUrl, { method: 'POST', body, headers });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { ok: false, status: res.status, error: detail || `ingest ${res.status}` };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: err instanceof Error ? err.message : String(err) };
  }
}
