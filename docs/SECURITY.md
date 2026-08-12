# Security baseline

## Hard boundaries for MVP
- Do not hold customer or merchant funds.
- Do not store bank usernames/passwords.
- Do not collect raw routing/account numbers in our UI.
- Do not mark ACH payments as final until the regulated provider reports settlement/final status.
- Do not expose full destination bank details to payers.
- Do not permit arbitrary person-to-person transfers.

## Required before live payments
1. Provider-hosted or tokenized bank authentication.
2. Merchant KYB and beneficial-owner verification through a qualified provider.
3. Customer/account ownership verification as required by rail/provider.
4. RBAC, MFA for merchant admins, device/session controls.
5. Signed webhook validation plus replay prevention.
6. Idempotency keys for all state-changing money operations.
7. Append-only audit events for invoice creation, edits, requests, approvals, webhook changes and refunds/returns.
8. Risk engine: velocity, amount, device, new-recipient, account-age and anomaly checks.
9. Manual review lane for high-risk/high-value transactions.
10. Incident response, breach handling, vendor management and access-review procedures.
11. Independent penetration test before meaningful production volume.
12. Legal/compliance review of the exact funds flow and contracts in every launch state.

## Data minimization
Store provider tokens and masked identifiers; avoid financial credentials. Encrypt sensitive fields at rest. Separate PII from operational records where practical. Set explicit retention/deletion schedules.
