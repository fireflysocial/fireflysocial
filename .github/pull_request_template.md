## What & why

<!-- What does this change, and why? Link the issue or user-flow section if relevant. -->

## How to test

<!-- Steps a reviewer can follow, or "covered by tests". -->

## Screenshots

<!-- For UI changes. Delete if not applicable. -->

## Checklist

- [ ] New or changed logic has unit tests, and `npm run test:coverage` stays at 100%
- [ ] UI change has a component test; new key flow has an E2E test
- [ ] Schema change: migration added, `npm run db:types` re-run, pgTAP tests cover new/changed RLS
- [ ] No secrets, service-role keys or real user data committed
- [ ] CodeRabbit comments addressed or dismissed with a reason
