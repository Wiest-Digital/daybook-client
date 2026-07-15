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
export type LeadResult = {
    ok: boolean;
    status: number;
    error?: string;
};
type BaseInput = {
    /** Where the lead originated (typically the request Referer). Server-trusted. */
    sourceUrl?: string;
};
export type LeadInput = (BaseInput & {
    fields: Record<string, string>;
    form?: undefined;
}) | (BaseInput & {
    form: FormData;
    fields?: undefined;
});
export declare function submitLead(config: LeadConfig, input: LeadInput): Promise<LeadResult>;
export {};
