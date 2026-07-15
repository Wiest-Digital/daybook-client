// Keys the server owns — a client-supplied value is dropped and replaced.
const OWNED = new Set(['ingest_token', 'source_url']);
export async function submitLead(config, input) {
    const doFetch = config.fetch ?? globalThis.fetch;
    let body;
    let headers = {};
    if (input.form) {
        const out = new FormData();
        for (const [key, value] of input.form.entries()) {
            if (OWNED.has(key))
                continue;
            out.append(key, value);
        }
        out.set('ingest_token', config.ingestToken);
        if (input.sourceUrl)
            out.set('source_url', input.sourceUrl);
        body = out; // browser/undici sets the multipart boundary content-type
    }
    else {
        const fields = input.fields ?? {};
        const clean = {};
        for (const [key, value] of Object.entries(fields)) {
            if (!OWNED.has(key))
                clean[key] = value;
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
    }
    catch (err) {
        return { ok: false, status: 0, error: err instanceof Error ? err.message : String(err) };
    }
}
