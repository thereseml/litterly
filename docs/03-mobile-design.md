# Mobile Design Specification

## Design Direction

**Keep the identity; redesign the interaction.** Warm cream canvas, brown actions, restrained white cards, quiet dividers, muted status colors, readable Inter, and the existing Litterly name/mark.

The app should feel like a well-kept breeder notebook with modern native ergonomics. Avoid bright generic SaaS gradients, oversized decorative cards, excessive pills, cartoon-pet illustrations, or an unrelated luxury rebrand. Real animal identity and useful care information should provide the personality.

Source of truth for inherited values: Catbreeder `frontend/src/theme.ts` and `frontend/src/styles/global.css` at the reviewed commit. The poster image is supplementary visual evidence, not an authoritative screenshot of every current screen.

## Inherited Color Tokens

| Token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `brand.primary` | `#8B7355` | Same inherited value | Brand, selected navigation, accent |
| `brand.light` | `#A68B6A` | Same inherited value | Decoration, soft accent |
| `brand.dark` | `#6B5344` | Same inherited value | Strong action/pressed variant |
| `brand.secondary` | `#D4C4B5` | Same inherited value | Subtle highlight |
| `brand.secondaryLight` | `#E8DDD3` | Same inherited value | Selected/subtle surfaces after contrast review |
| `brand.secondaryDark` | `#B8A894` | Same inherited value | Decorative boundary/accent |
| `background` | `#FAF8F5` | `#1A1A1A` | App canvas |
| `surface` | `#FFFFFF` | `#2D2D2D` | Cards/sheets |
| `text.primary` | `#3D3632` | `#F5F5F5` | Main copy |
| `text.secondary` | `#6B6058` | `#B0B0B0` | Supporting copy |
| `border` | `#E8E2DC` | `#404040` | Quiet boundaries, not sole input affordance |
| `success` | `#7DA87B` | Same inherited value | Positive state decoration |
| `warning` | `#D4A574` | Same inherited value | Review cue decoration |
| `error` | `#C97B7B` | Same inherited value | Error decoration |
| `info` | `#7BA8C9` | Same inherited value | Informational decoration |

The CSS also includes `#9A8F85` as muted text. Do not assume it is readable for small text. Existing semantic colors are often too light with white foreground text.

### Accessibility-Safe Adaptation

- Preserve these as the brand palette, not as an instruction to copy every foreground/background pairing.
- Require at least 4.5:1 for normal text and 3:1 for large text and essential non-text controls. Validate actual composited pairs in both modes.
- If white on primary fails normal-text contrast, use inherited `brand.dark` for filled-action surfaces, retaining primary for brand accents.
- Use dark text on light semantic badges. Do not put small white text on inherited green/amber/rose without measurement.
- Derive darker semantic foregrounds and stronger input/focus boundaries where needed, document them as accessibility variants, and do not alter the entire theme.
- Keep status labels/icons in addition to color. A collar identifier needs both color and text.

## Typography, Spacing, And Shape

| Element | Source baseline | Native recommendation |
| --- | --- | --- |
| Typeface | Inter with system fallback | Bundle licensed Inter weights 400/500/600/700; system fallback during loading |
| Screen title | 24 px / 700 | 24-28 logical units / 700, scalable |
| Section title | 20 px / 600 | 20 / 600 |
| Card title | 18 px / 600 | 18 / 600 |
| Body | 15 px | Prefer 16 for phone reading, do not freeze font scaling |
| Supporting text | 14 px | 14-15, with accessible contrast |
| Caption | 13 px | 13 minimum for secondary data, not primary entry |
| Space scale | 4 px base | 4, 8, 12, 16, 24, 32, 48 logical units |
| Input/button radius | 6 px | Retain 6-8 |
| Card radius | 10 px | Retain 10 |
| Large/sheet radius | 16 px in CSS | 16 for sheets, with platform-appropriate behavior |
| Elevation | Very subtle brown-tinted shadow | Prefer quiet borders/subtle elevation, no stacked heavy shadows |

Use tabular numerals for weights and deltas. Minimum touch target is 44 points on iOS and 48 dp on Android. Input rows should be approximately 52-56 logical units tall, growing with content. Do not shrink labels to fit five tabs or truncate critical status/error text.

## Brand Assets

- Retain the existing Litterly wordmark and animal/growth motif.
- Source asset: `frontend/src/assets/litterlyLogo.png`; source icons: `frontend/public/apple-touch-icon.png` and favicons.
- Inspect transparency, resolution, rights, and light/dark legibility before reuse. Obtain or recreate an approved vector master rather than enlarging the web PNG blindly.
- App icon should use the recognizable mark, not squeeze the entire wordmark into a square. Prepare iOS and Android adaptive/monochrome assets from the same identity.
- Splash screen is a quiet cream/dark canvas with the mark, not an artificial loading animation.
- Animal photos are a next-release enhancement; v1 identity uses initials/species icon plus collar label.

## Information Architecture

Preserve the five familiar destinations, but make the first destination task-oriented:

| Tab | Swedish production label | Contains |
| --- | --- | --- |
| Today | `Idag` | Care priorities, active litters, quick actions, upcoming guidance |
| Litters | `Kullar` | Planned/born/completed lists, litter detail, birth, weighing, litter tasks |
| My animals | `Mina djur` | Retained/foster/acquired animals, current/former, animal detail |
| Buyers | `Köpare` | Waitlist/contacts, reservations, handover, email |
| Insights | `Statistik` | Litter growth and measurement comparisons |

Use actual Swedish characters in production copy; the ASCII examples in planning prose are not localization resources.

Top-level header: modest wordmark or screen title, task/notification entry, profile/avatar. Appearance moves into profile rather than occupying a permanent header button. No sixth native admin tab.

Profile contains account, plan, preferences, exports, help/privacy, deletion, and logout. Litter screens link to contextual insights; do not send users to a generic chart that forgets their selected litter.

Use native stack navigation within each tab. Back returns to the originating litter/contact rather than always resetting a tab. Universal links and notification taps resolve to the same detail routes after authentication/authorization.

## Screen Specifications

### Today

```text
Litterly                         Tasks   Profile
Today, 14 November

Needs attention
One review cue or overdue care item, with reason

A litter                       12 days old
4 of 6 weighed today
[ Continue weighing ]

Today's care
[ ] Reviewed lifecycle task
[ ] Planned follow-up

Upcoming
Expected births / next care milestone

Today   Litters   My animals   Buyers   Insights
```

The primary action follows the breeder's actual state: create first litter, record birth, start weighing, or resume draft. An empty insight chart never takes priority over recording care.

### Litter List And Detail

- List uses Planned / Born / Completed segments, search, species filter, and an accessible add action.
- Each row shows name, species, lifecycle, date/age, and offspring count where known.
- Detail hero shows parents, lifecycle, age/expected date, and primary contextual action.
- Detail sections are Overview, Animals, Care, Buyers; short tabs may scroll with clear affordance or become a section menu at large text sizes.
- Overview includes compact timeline and optional growth preview. Animals use identity rows, not large decorative cards.
- Planned litter primary action is Record birth. Born litter primary action is Weigh litter. Completed litter offers View history and explicit correction actions.
- Birth flow is a short full-screen form with a review step; bulk offspring registration is separate and resumable.

### Litter Weighing

```text
Back                    Weigh A litter
Date: 14 November                 Change
Saved draft on this device

Blue collar / Luna
Last: 245 g, yesterday
[ 258       ] g       +13 g / +5.3%

Red collar / Leo
Last: 250 g, yesterday
[ 235       ] g       Review: -15 g / -6.0%

4 entered, 2 skipped
[ Review and save 4 weights ]
```

- Dedicated full-screen route, not a cramped modal over navigation.
- One stable row per animal with readable identity. Optional single-animal focus mode can follow testing; not required for v1.
- Decimal keyboard, next/done actions, and an explicit skip/clear behavior.
- Footer remains above keyboard and safe-area insets; rows scroll without losing focus.
- Prevent duplicate save, but do not trap a failing request indefinitely. Leaving offers keep draft/discard and reconciles pending server state.
- Confirmation distinguishes confirmed server save from local draft. Use short haptic confirmation only after actual success.
- Weight review cues include text and values, never only a red background. No frightening or diagnostic language.

### Animal Detail

- Header: identity/collar, name, species/sex, age, lifecycle status, optional litter link.
- Primary action: add weight when eligible; secondary: diary entry.
- Sections: Growth, Diary, Details/health tests, Buyer/reservation where applicable.
- Current/former own-animal history and parent-litter links remain reachable.
- Status changes involving reservation or sale lead through the linked workflow, not an independent status dropdown.
- Destructive operations are in an explicit menu with consequences; accidental swipe must not permanently delete care history.

### Buyer And Handover

- Buyers list supports search and waitlist/buyer filters, with readable name, stage, and associated animal.
- Contact detail separates contact data, private notes, interests, and active/past reservations.
- Call/email use appropriate platform actions; in-app email composer clearly identifies sender/recipient and awaits server result.
- Reserve sheet selects an eligible animal, with optional litter filtering, and confirms the resulting status. It also opens directly from an animal, including an acquired animal without a litter.
- Handover is a full-screen checklist/review, not a tiny delivered-status chip.
- No payment card for animal deposits or automatic legal contract generation in v1.

### Insights

- Start with litter selection, recent date range, and readable summary.
- Compare selected animals by stable ID; use distinguishable stroke patterns/markers as well as colors.
- Display latest weight, actual change interval, and missing-measurement information.
- Wide comparison tables become compact rows with drill-down, not horizontally clipped desktop tables.
- Provide chart data in a screen-reader-friendly measurement list. A single measurement is a point, not a fabricated trend.

### Profile, Plans, And Recovery

- Prefer native grouped settings rows to a desktop tab panel.
- Plans show coverage, provider, renewal/expiry, localized price/terms, restore, and provider-appropriate management.
- Keep read/export/support available when an entitlement expires.
- Account deletion has an impact summary and recent-authentication step; it is distinct from canceling renewal.
- Password reset/verified links have expired/used/wrong-account states and a web fallback.

## Interaction And State Standards

| Situation | Required treatment |
| --- | --- |
| Initial loading | Quiet skeleton or progress indicator with accessible announcement |
| Empty list | Explain what is missing and offer one relevant action |
| Load failure | Visible error and retry; never substitute an empty list |
| Stale/offline | Show last sync and disable server-dependent confirmation, while allowing draft editing |
| Save failure | Inline error, retained input, retry/reconcile, no false success toast |
| Conflict | Explain what changed and require explicit review; no silent overwrite |
| Destructive action | Impact summary, confirmation, reauthentication where appropriate |
| Long text | Wrap/reflow, preserve touch targets, no critical ellipsis-only value |
| Permissions denied | Graceful fallback and optional link to settings, not repeated prompts |

Support iOS back gestures, Android back/predictive-back where supported, keyboard dismissal, screen-reader focus restoration, reduced motion, and system light/dark. Keep forms usable from narrow phones through landscape and tablets with a centered content width or adaptive list/detail layout.

Do not port the existing website's tablet settings gap, fixed 56px bottom bar without safe-area treatment, hover-only cues, or tiny navigation labels.

## Design Validation Deliverables

1. Token sheet with measured contrast pairs in light/dark.
2. Clickable prototype: onboarding, planned litter, birth, six-animal weighing, reservation, handover, recovery.
3. Reusable native primitives: screen, type, button, field, date input, status badge, identity row, task row, chart summary, sheet, error/empty state.
4. Device screenshots at narrow/large phone widths, large text, keyboard-open state, and landscape.
5. Moderated test with 3-5 breeders using fictional data, including one cat and one dog journey.

Prototype approval is about continuity, clarity, and speed, not adding every possible feature before implementing core care.
