# Compliance design notes — not legal advice

This project is intentionally structured so the MVP is a software/payment-request layer and a regulated provider performs account authentication and money movement.

Before production, counsel should determine whether the exact structure triggers federal or state money-transmitter/MSB requirements, money transmission licensing, agent/payment-processor exemptions, ACH Third-Party Sender or Third-Party Service Provider status, state lending/escrow rules, or other obligations.

Key workstreams:
- FinCEN/MSB and state money-transmission analysis based on actual funds flow.
- Nacha role mapping and ACH authorization/record-retention requirements.
- Regulation E / consumer EFT disclosures and error-resolution responsibilities where applicable.
- UDAAP/UDAP review of fees, status messaging, reversibility and payment timing.
- OFAC/sanctions and BSA/AML allocation with provider/bank partners.
- KYB/KYC/CIP allocation in contracts.
- Privacy: GLBA/state privacy applicability, vendor contracts and data-sharing notices.
- Information-security program, access controls, incident response and vendor oversight.

No production launch should occur until the provider agreement and legal memo confirm who is the ODFI/originator/processor, who owns fraud losses and returns, and whether ClearRail ever receives or controls funds.
