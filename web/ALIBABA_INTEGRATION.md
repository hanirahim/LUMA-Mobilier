# LUMA Mobilier — Alibaba dropshipping integration

This is a **non-operational scaffold** on the `integration-alibaba` branch. It does not import products, create supplier orders, or charge customers.

## Before enabling Alibaba
1. Wait for approval of the ISV-Dropshipping application and verify the exact permitted API methods.
2. Store the App Key, App Secret and OAuth tokens only in server-side secrets, never in Git or browser code.
3. Confirm permission to reuse supplier descriptions and images.
4. Map authorized supplier products to `Product` in `src/lib/types.ts`, preserving supplier IDs, variants, MOQ, currency, and price freshness.
5. Validate costs (freight, VAT, duties, returns) and stock before publishing.
6. Replace JSON file persistence with a durable database and secure the demo administrator login.
7. Implement verified payment webhooks, deduplicated order submission, supplier-payment authorization, retry/reconciliation, and tracking before real orders.

## Current files
- `src/lib/alibaba/types.ts`: normalized supplier product and order types.
- `src/lib/alibaba/client.ts`: server-only guard and disabled placeholders.
- `.env.alibaba.example`: names of private environment variables.

No official endpoint or signature algorithm is assumed before access is granted.

## OAuth implementation status (October 2026)
- Alibaba API permission group `ICBU Dropshipping Solution Api Group` was shown active for App Key `504822`; this is **not** a usable OAuth token.
- The Vercel preview callback `/api/alibaba/callback` is reachable, but authorization and token exchange remain disabled.
- The branch has a guarded `/api/alibaba/authorize` route which requires `ALIBABA_OAUTH_AUTHORIZE_URL` and `ALIBABA_OAUTH_REDIRECT_URI`; **do not configure or expose this route until the exact Alibaba authorization URL, query parameter names, and callback registration are verified against official docs**. The current query parameters are provisional.
- Official Alibaba API reference documents `GET/POST /auth/token/create` with required `code`. The API call must use Alibaba's documented signing/authentication rules; do not send the App Secret in query strings or client-side JavaScript.
- Before exchanging codes: implement persistent encrypted token storage, refresh logic, single-use state protection, error handling, and authorized account binding. OAuth tokens must not be committed to GitHub or shown in screenshots.
- Preview environment variables for branch `integration-alibaba` are not automatically available to the production `main` deployment.
- Production launch must wait for actual API product tests, supplier order safeguards, and proper durable persistence.
