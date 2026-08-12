# Threat model v0.1

| Threat | MVP control | Production control |
|---|---|---|
| Fake merchant | Demo-only merchants | KYB, beneficial-owner verification, bank-account ownership checks |
| Invoice tampering | Server validation | Signed immutable invoice version + audit event + customer reconfirmation after edits |
| Payment-request phishing | Canonical domain + explicit recipient | Verified merchant profile, anti-phishing messaging, DMARC/SPF/DKIM, signed links, expiry |
| Account takeover | No auth in demo | Passkeys/MFA, session rotation, device risk, recovery controls |
| Bank credential theft | Never collected | Provider-hosted/tokenized bank auth only |
| Webhook spoofing | No live webhooks | HMAC/signature verification, timestamp tolerance, replay store |
| Duplicate debit | No live debit | Idempotency + unique operation key + provider idempotency |
| ACH return / NSF | Demo status only | Pending/settled/returned state machine; never promise funds too early |
| Insider misuse | Minimal data | RBAC, least privilege, dual control for sensitive changes, audit review |
| PII leak | Minimal demo data | Encryption, secrets manager, logging redaction, retention limits |
