# Product

## Register

product

## Users

Internal staff of a children's health & nutrition consultation practice (Olesia). Two roles:

- **admin** — full access, including managing back-office users.
- **editor** — manages content and operations (appointments, subscriptions, quick questions, blog, services, contacts, about) but not users.

Context of use: a focused back-office tool used during the working day to run consultations operations — reviewing video-consultation bookings, confirming payments by hand, answering 48h quick-question tickets, tracking monitoring subscriptions, and editing the public site's content. Not a public surface; closed registration (admin creates accounts).

## Product Purpose

A single Romanian-language admin panel that owns everything the public marketing site cannot: appointments & Calendly-driven bookings, subscriptions and quota, quick-question tickets, manual payment confirmation, GDPR-sensitive client data (names, emails, medical attachments), and the bilingual (RO/EN) CMS content for the site (blog, services, contacts, about). Success = staff trust it, move through daily operations without friction, and never wonder which control does what.

## Brand Personality

Calm, precise, trustworthy. Three words: **clinical-warm, legible, unhurried.** It is related to the public site's identity (sage green, natural warmth) but expressed as a quiet, focused tool — the brand is a signal, not the subject. The interface should disappear into the task.

## Anti-references

- Cream/sand-drenched marketing aesthetic carried into the admin (the public site is warm; the tool is not a brochure).
- Stock, identity-less grayscale shadcn admin with a default utility-blue accent.
- Gratuitous motion, oversized display headings, decorative cards, dashboard hero-metric clichés.
- Inconsistent component vocabulary between sections.

## Design Principles

1. **The tool disappears.** Earned familiarity over novelty; standard affordances for standard tasks.
2. **One quiet brand signal.** Sage carries primary actions, selection, and focus — nothing decorative.
3. **Every state is designed.** Loading (skeletons), empty (teaches the section), and error are first-class, not afterthoughts — required across all sections.
4. **Romanian, centralized.** All UI strings live in one dictionary; no hardcoded labels in components, even though the UI is single-language.
5. **Roles are visible truth.** What a user can't do, they don't see (e.g. Users is admin-only).

## Accessibility & Inclusion

- Target WCAG 2.1 AA: body text ≥4.5:1, large text ≥3:1, visible focus ring on every interactive element.
- Full keyboard operability (nav, menus, dialogs, forms); Radix primitives for correct semantics/focus management.
- `prefers-reduced-motion` honored on every transition.
- Handles GDPR-sensitive PII — PII-safe display, no sensitive data in toasts/logs.
