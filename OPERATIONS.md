# Operations

1. Run `scripts/bootstrap.sh`, replace every placeholder in `.env`, then run `scripts/migrate.sh`.
2. Provision the first administrator through an approved database/identity process, then run `./start.sh`.
3. Demo data is destructive and opt-in: `CONFIRM_DEMO_SEED=yes scripts/seed-demo.sh` outside production only.

`/api/operations` governs eligibility, assignments, offline check-ins, incidents, and manual dispatch. Offline events are idempotent by jurisdiction/device/sequence and remain pending until verified. Real roster, LMS, GIS, identity, messaging, and incident adapters plus jurisdiction approval and election-day exercises remain deployment requirements.
