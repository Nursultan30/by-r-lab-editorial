# amoCRM integration (preview)

The production domain is served by a static HTML site, not Next.js. `api/lead.js` is a Vercel Node.js serverless function, while `src/amo-client.js` adds name/phone fields and submits both main and uniform forms to `/api/lead`.

## Setup

1. **Revoke the token posted in chat** and issue a new long-lived token with CRM permissions. Never commit it or paste it into chat.
2. Add `AMOCRM_DOMAIN`, `AMOCRM_TOKEN`, `AMOCRM_PIPELINE_ID`, `AMOCRM_STATUS_ID` in Vercel Project Settings → Environment Variables for the target preview/production environments. Values are in `.env.example` except the actual token.
3. Test on a preview deployment, with a test contact and phone. Ensure correct pipeline/status; verify both forms.
4. Production deploy only after review.

The API searches existing contacts by phone, creates if needed, creates a lead, and adds a detailed note with service and UTM parameters. Errors are handled without exposing token. A repeated submission may create a second lead: add durable idempotency and distributed rate limiting before high-traffic campaigns. No acceptance is claimed until CRM creates the lead. WhatsApp shortcuts outside forms are unchanged.

Build: `npm run build` copies `src` to `dist`. Vercel picks up the root `/api` Node.js function alongside static output.
