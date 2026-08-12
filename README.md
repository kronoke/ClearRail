# ClearRail MVP

A compliance-first prototype for replacing high-value business checks with verified bank-payment requests.

## Principle
ClearRail is the orchestration and UX layer. A regulated provider/bank should perform bank authentication and money movement. The MVP does **not** hold funds, store bank credentials, or originate ACH.

## Run
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## What exists
- Landing page
- Merchant demo dashboard
- Customer payment-request review screen
- Input validation
- Baseline security headers
- API skeletons
- Security, compliance and threat-model documents

## Next build step
Add authentication + database + immutable audit log, then integrate a regulated provider **in sandbox only** after the exact funds-flow design is reviewed.
