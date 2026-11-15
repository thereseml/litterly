# Litterly

A mobile-first companion for cat and dog breeders, from planned litter to daily care and handover. Intended for iPhone and Android, preserving the existing Catbreeder/Litterly visual identity.

## Product And Build Blueprint

This repository currently contains planning documentation, not an implemented mobile app. The blueprint is based on a read-only review of the private [Catbreeder repository](https://github.com/thereseml/catbreeder) at commit `35f11a94d85f0099cc905de943cf888b2f033e05` on 2026-11-14.

| Document | Purpose |
| --- | --- |
| [Source review](docs/01-catbreeder-review.md) | What exists, what to preserve, current gaps, and traceable source references |
| [Product requirements](docs/02-product-requirements.md) | Product direction, release boundaries, journeys, and acceptance criteria |
| [Mobile design](docs/03-mobile-design.md) | Exact inherited colors, native navigation, screen specifications, and accessibility |
| [Architecture](docs/04-architecture.md) | Expo recommendation, API reuse, security, billing, notifications, and migration |
| [Domain rules](docs/05-domain-and-api.md) | Entities, lifecycle rules, dates, weights, reservations, and proposed API contracts |
| [Delivery plan](docs/06-delivery-plan.md) | Ordered implementation backlog, dependencies, test strategy, and launch gates |
| [Questions for Therese](docs/07-questions-for-therese.md) | Decisions to answer later, recommended defaults, and what each decision affects |

## Recommended Direction

- Build a genuine React Native app with Expo and TypeScript, not a website wrapped in a WebView.
- Keep the warm cream/brown theme, Litterly branding, cat and dog support, and the existing breeding lifecycle.
- Make daily litter weighing the signature interaction, supported by a task-oriented Today screen.
- Connect buyers, reservations, and handover instead of maintaining unrelated status fields.
- Reuse and harden the existing Express/MongoDB API unless a deliberate backend-replacement decision is made.
- Start online-first with protected local drafts. Add automatic offline synchronization only after its conflict rules are implemented.
- Ship a focused breeder app first. Buyer portals, teams, pedigree analysis, and accounting are later opportunities.

All new architecture, release scope, and changed business rules are recommendations, not approved commercial or legal decisions. The questions document records the assumptions; it does not block prototype work.

## Suggested Reading Order

Read product requirements and mobile design first for the experience. Read the source review for the rationale, then architecture, domain rules, and delivery plan for implementation. Answer the separate questions document when convenient.
