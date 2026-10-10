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
