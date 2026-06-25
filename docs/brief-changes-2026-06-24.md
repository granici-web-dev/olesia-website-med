# Client brief changes — 2026-06-24

Source: `docs/Бриф проекта — Dr. Olesea Jalba.csv` (client's answers to our questions).
This file is the working plan for implementing those answers. Read it before starting brief work.
Status legend: ✅ ready to do · ⛔ blocked on client · ❓ needs Serghei's decision.

---

## 0. Headline impact

The brief **redefines the service catalog** and adds several large features. Three heavy items:

1. **Currency + pricing changed completely** → now **EUR** (was MDL/lei); durations changed; catalog grew from 5 to ~13 services.
2. **Catalog must become data-driven** — client explicitly requires editing prices/durations/descriptions AND adding new services from the back office "fără intervenție tehnică". Current model hardcodes 5 service codes in `packages/shared` + copy in `apps/frontend/lib/service-content.ts`. ❓ See §10.
3. **Biblioteca Digitală** — new downloads module (email-gate, free + paid materials, search, age filter, categories, newsletter). Today only a static `/guides` stub exists.

---

## 1. Service catalog overhaul ⚠️

Currency: **MDL → EUR** everywhere (pricing page, homepage services, service landing pages, `SERVICE_PRICE_META` in `apps/frontend/lib/service-content.ts`).

| Current code | Now in code | New per brief |
|---|---|---|
| `pediatric` | 50 min · 600 lei | **30 min · 28 EUR** |
| `nutrition` | 60 min · 700 lei | **split into two ↓** |
| `nutrition_copii` *(new)* | — | 60 min · 38 EUR |
| `nutrition_adulti` *(new)* | — | 60 min · 38 EUR |
| `integrative` | 90 min · 1100 lei | 90 min · **58 EUR** |
| `quick_question` | 48h · 180 lei | rename **"Întrebare EXPRESS"**, **~1h · 8 EUR** |
| `monitoring` (Abonament) | 3 luni · 2400 lei (1 type) | **4 types × 1/2/3/6 months, prices ⛔ TBD** |

Client note: "Prețurile, durata și descrierile trebuie să poată fi modificate ulterior din panoul administrativ… sistemul trebuie să permită adăugarea pe viitor a unor servicii noi." → drives §10.

## 2. New service category — deliverables / protocols (group C) ❓

5 new async "product" services that are **neither Calendly slots (A) nor open-ended portal subs (B)** — they're pay → form/upload → delivered result:

- Meniu Personalizat **7 zile** — 28 EUR
- Meniu Personalizat **14 zile** — 48 EUR
- Meniu Personalizat **30 zile** — 88 EUR
- Protocol Individualizat **Pediatrico-Nutrițional** — 98 EUR
- Protocol Individualizat **Alimentație Complementară (sugari)** — 98 EUR

Architecture needs a 3rd category (call it group **C / deliverable**). Flow ≈ group B (pay → dedicated form + document upload → written/PDF delivery), but they are one-off products, not subscriptions.

## 3. Subscriptions (Abonament) restructure ⛔ price

Currently `monitoring` = single 3-month service, 2400 lei, `videoQuotaPerMonth: 2`. Brief redefines it:

Types (4): Abonament **Pediatrie** · Abonament **Nutriție Copii** · Abonament **Nutriție Adulți** · Abonament **Complex Pediatrie + Nutriție**.
Durations (4): **1 / 2 / 3 / 6 months**.
Flow: pay online → detailed medical+nutrition form → upload analyses/docs → initial eval & goals → personalized plan → periodic monitoring + continuous communication (email and/or WhatsApp) → adjustments → scheduled re-consults.
**Prices: not provided** → ⛔ ask client (per type × duration matrix).

## 4. Întrebare EXPRESS (was Întrebare rapidă) ✅ spec / ⛔ tone of "1h"

- SLA changed **48h → ~1 hour** "în timpul programului de lucru". Update `dueAt` logic + all copy ("48h · scris" label in `service-content.ts`, landing page, contact CTA "Întreabă medicul · 48h").
- Price **180 lei → 8 EUR**.
- Rename to "Întrebare EXPRESS" across UI.
- Response delivered via **email and/or WhatsApp**.
- Copy includes important disclaimers (not an emergency service, doesn't replace full consult, one main question per request) — add to landing page.

## 5. Real contacts & social ✅ quick win

Replace placeholders in `apps/frontend/components/layout/Footer.tsx` and `apps/frontend/app/[locale]/contact/page.tsx`:

- **Phone:** `+373 79 000 000` → **+373 68837774** (tel href `+37368837774`)
- **Email:** `contact@oleseajalba.md` → **oleseajalba@gmail.com**
- **Address:** online + partner clinics; exact address TBD — keep generic for now.

Social (currently bare placeholders; footer/contact also inconsistent www vs non-www):
- Instagram: `https://instagram.com/dr.olesea_jalba_pediatru`
- Facebook: `https://www.facebook.com/olesea.jalba.2025/`
- **Telegram (new channel):** `https://t.me/dr_olesea_jalba_official` — add it.
- **Drop LinkedIn** (client never asked; currently shown on contact page).
- TikTok/YouTube: not now, but keep the social config easy to extend.

## 6. New features

### 6a. Biblioteca Digitală (downloads catalog) — large new module
Client wants a real digital library, not the static `/guides` stub. Required:
- 9 categories: Pediatrie · Urgențe și prim ajutor · Nutriție copii · Nutriție adolescenți și adulți · Alimentație complementară · Alergii și intoleranțe · Dezvoltarea copilului · Sănătate emoțională și parenting · Ghiduri practice și checklist-uri.
- Materials **free OR paid** (per material).
- **Email collection before download** (newsletter opt-in).
- **Search** within the library.
- **Filter by child age** + by topic (see §8).
- Add materials from back office without code.
- Flags: recommended / popular / newly added.
- Newsletter integration (notify on new materials).
- Brief lists ~20 launch guides + ~14 planned — content comes staged.
→ New API module (e.g. `materials`/`library`) + back-office CRUD + storefront. Replaces/extends current `/guides`.

### 6b. Analytics stack — green field (nothing exists today)
- GA4
- Google Tag Manager
- Google Search Console
- Meta Pixel
- Track: traffic, conversions, **bookings**, **material downloads**.
→ Needs env vars + GTM container; decide consent/cookie banner (GDPR).

### 6c. Newsletter / email marketing
Referenced 3× (library, promotion, wishlist). Nothing exists today. Tied to the fact client has **no email/SMTP yet** (see `mesaje-feature` memory). ❓ Pick provider (e.g. self-hosted list vs Mailchimp/Brevo/Resend audiences).

## 7. Homepage / About content sections (wishlist Q17) — needs client texts ⛔
New sections requested (build when texts/photos arrive):
- "De ce să lucrezi cu mine?" (18+ years, Master în Nutriție Umană, integrated approach, evidence-based, individualized plans, prevention, long-term monitoring).
- "Cum decurge colaborarea?" (booking → medical form → consult → plan → monitoring).
- "Valori profesionale".
- "Apariții media" (TV, interviews, conferences).
- "Diplome, certificări și formare profesională continuă".
- Two italic quotes + a services slogan for homepage/About (exact text given in CSV rows ~367–370).
- Other future-flagged: testimonials (written + video), FAQ, anonymized clinical cases, WHO growth curves, newsletter signup. Most are "posibilitatea ulterioară" (future) — log, don't build now.

Differentiator to emphasize throughout: **integrated Pediatrics + Nutrition**.

## 8. Age filter (blog + library)
Filter articles & materials by child age: **0–6 mo / 6–12 mo / 1–3 / 3–6 / 6–12 (școlar) / adolescent**. Shared taxonomy across `blog` and `materials` modules.

## 9. Video platform / Calendly
Consultations run via patient's choice: **Google Meet / WhatsApp Video / Instagram Video / Viber Video**. For Calendly bookings: ideally auto-generate a **Google Meet** link and send it with the confirmation. → Configure Calendly event types with Google Meet location.

## 10. ❓ Architectural decision — data-driven service catalog
Tension: CLAUDE.md says "Services (5)", fixed enum, map booking "by `event_type` URI only". Brief requires admin-editable prices/durations/descriptions **and adding new services without a developer**.
Options:
- **(A) Data-driven now:** services become DB rows managed in back office; Calendly maps `event_type_uri → service_id`; frontend reads catalog from API. More upfront work, but matches the brief and avoids a frozen-frontend rewrite later.
- **(B) Hardcode through launch:** keep enum + `service-content.ts`, just update values to the new catalog; refactor to data-driven post-launch.
Recommendation: lean **(A)** for the catalog data (prices/durations/descriptions/active flag), keep a stable internal `code` for Calendly mapping. Confirm with Serghei.

---

## Blockers — ask the client ⛔ (Russian, ready to forward)

1. **Цены подписок (Abonamente).** Нужна матрица цен: 4 типа (Pediatrie / Nutriție Copii / Nutriție Adulți / Complex) × 4 длительности (1/2/3/6 мес). Ни одной цены в брифе нет.
2. **Юр. данные.** Форма (PFA/SRL/физлицо), официальное название, рег. данные, юр. адрес — для /terms, /gdpr, /privacy. Клиент написал «furnizate separat» — ждём.
3. **Финальные тексты услуг** (pediatrie, nutriție copii/adulți, integrativă, протоколы, меню, express, abonamente) — «în proces de revizuire». Нужны для публикации.
4. **Тексты статей + картинки** к запуску: сколько статей и когда. **Ответ клиенту по каналу загрузки: Google Drive** (решено 2026-06-24) — попросить расшарить одну общую папку (тексты в Google Docs + изображения), доступ на designer.nefele@gmail.com.
5. **Точный адрес клиники** — показывать ли на сайте, и какой.
6. **Подтверждение «~1 час»** для Întrebare EXPRESS как публичного SLA (это обещание клиентам — убедиться, что реалистично) + рабочие часы (program de lucru) для отображения.
7. **Тексты для секций** Q17 (De ce să lucrezi cu mine / Cum decurge / Valori / Apariții media / Diplome) + фото + список медиа-появлений.
8. **Newsletter/Email:** будет ли почтовый домен/SMTP и какой провайдер рассылки — без этого email-gate библиотеки и рассылки не запустить.
9. **Платные материалы библиотеки:** оплата ручная (как сейчас payment_status) или нужна онлайн-оплата? Это меняет объём.

---

## Decisions — RESOLVED with Serghei (2026-06-24) ✅

1. **Catalog = data-driven NOW (option A).** Services become DB rows managed in back office (code, group, title_ro/en, description, price_eur, duration, active). Frontend/pricing reads `/api/services`. Calendly maps `event_type_uri → service_id`. Keep a stable internal `code` for the Calendly mapping. Phase 1 builds this, not the hardcode shortcut.
2. **Biblioteca Digitală = full module NOW.** API `materials` (category, age, free/paid, file, flags) + back-office CRUD + storefront (search, age/topic filter, email-gate, featured/popular/new). Migrate the `/guides` stub into it.
3. **Paid downloads = manual payment confirm** — reuse existing `payment_status` pending→confirmed flow (no payment provider). File access granted after manual confirmation. (No online payment for now.)
4. **Tomorrow starts with Phase 0** (quick wins: real contacts, socials +Telegram −LinkedIn, GDPR operator), then Phase 1.

Still open (provider choice): **Newsletter provider** — depends on blocker #8 (client email/SMTP).

---

## TODO — phased plan

### Phase 0 — Quick wins (no blockers) ✅ DONE 2026-06-25
- [x] Replace phone/email in Footer + contact page with real values (+373 68837774 · oleseajalba@gmail.com). Also fixed terms/gdpr META email.
- [x] Replace social links; add Telegram; remove LinkedIn; normalize www usage.
- [x] Set GDPR data operator (Dr. Olesea Jalba, oleseajalba@gmail.com) on /gdpr (legal entity PFA/SRL still ⛔ blocker #2).

### Phase 1 — Service catalog + pricing (after decision §10) — 🟡 IN PROGRESS 2026-06-25
- [x] Decide data-driven (A) vs hardcode (B). → **(A)**; services already are a DB model + CRUD + back-office screen, so no new infra needed — Phase 1 is data/copy.
- [x] Switch currency MDL → EUR across pricing UI + `SERVICE_PRICE_META` + seed + back-office (commit `43e1624`).
- [x] Update durations/prices: pediatric 30min/28€; nutrition 60/38€; integrative 90/58€; quick 8€.
- [x] Rename quick_question → "Întrebare EXPRESS", SLA 48h→~1h (public copy), email/WhatsApp delivery, disclaimers (commit `a007e20`).
- [~] **Split `nutrition` → copii / adulti.** PARTIAL (commit `3e5b06e`) — chose the **contained frontend approach**: 1 catalog service "Consultație nutrițională", two audience-specific Calendly events surfaced as two booking buttons on /nutrition (`Programează · copii` / `· adulți`). Same 60min/38€. Client supplied two dedicated, non-colliding Calendly events:
  - copii → `…/consultatie-nutritionala-pentru-copii`
  - adulti → `…/consultatie-nutritionala-pentru-adulti`
  - URLs in `apps/frontend/lib/calendly.ts` (`nutrition_copii` / `nutrition_adulti`).
  - **Still deferred (backend pass):** full catalog split into two codes (`nutrition_copii`/`nutrition_adulti`) = separate /pricing rows + homepage/services tiles + landing pages + shared/Prisma enum + migration + back-office. And the real `event_type` API URIs (`api.calendly.com/event_types/<uuid>`) for webhook routing — the booking buttons use scheduling URLs only; backend mapping needs the UUIDs.
- [~] **Add group C deliverables:** 3 menus (7/14/30 → 28/48/88€) + 2 protocols (98€). PARTIAL (commit `3d74f08`) — surfaced as a **"Livrabile" section on /pricing** (local array, trilingual), ordering → /contact (manual interim). Prices final, copy interim (client texts pending). **Still deferred (backend pass):** `ServiceGroup` C + catalog modeling + dedicated order form/upload + delivery flow.
- [ ] **Restructure subscriptions:** 4 types × 4 durations. DEFERRED — ⛔ prices blocked (#1). Monitoring shown as "Preț la cerere" (price 0) interim.
- [ ] Update `packages/shared` enums/DTOs + Prisma schema + seed. PARTIAL — catalog **values** updated; new enum codes (nutrition split, group C) pending the deferred items above.

  ⚠️ **Before launch (blocker #6):** confirm "~1h" SLA is realistic + get exact `program de lucru`; then update the back-office operational 48h SLA countdown (`dueAt`/deadline-indicator) to match the public promise.

### Phase 2 — Biblioteca Digitală (after decision §3 above) — 🟡 STOREFRONT DONE 2026-06-25
- [x] **Storefront** (commit `2328090`) on /guides: 9 categories, search, category + child-age filters, free/paid badges, flags (recommended/popular/new), **email-gate** modal before free downloads, featured material. Rebrand /guides → "Biblioteca digitală" (+ footer nav label).
  - Shared **age taxonomy** `apps/frontend/lib/age-taxonomy.ts` (reusable by blog — Phase 6).
  - Catalog data `apps/frontend/lib/placeholder-materials.ts` (~12 interim materials); client shelf `components/sections/MaterialLibrary.tsx`. Removed old free-only `GuideLibrary`.
  - Email-gate is **UI-only** (unlocks download; no persistence) — newsletter wiring blocked (#8). Paid materials → /contact (manual, no payment provider).
- [ ] API `materials` module (categories, age taxonomy, free/paid, file, flags). DEFERRED — backend pass.
- [ ] Back-office CRUD. DEFERRED — backend pass.
- [ ] Wire real PDFs + paid-download flow + newsletter persistence. DEFERRED (paid model = manual; newsletter ⛔ #8).

### Phase 3 — Analytics
- [ ] GTM container + GA4 + Meta Pixel + Search Console verification.
- [ ] Cookie/consent banner (GDPR).
- [ ] Events: booking, download, lead submit.

### Phase 4 — Newsletter (after blocker #8)
- [ ] Pick provider; signup component; library email-gate integration.

### Phase 5 — Content sections (after client texts)
- [ ] De ce să lucrezi cu mine / Cum decurge colaborarea / Valori / Apariții media / Diplome.
- [ ] Homepage/About italic quotes + slogan.

### Phase 6 — Age filter
- [ ] Shared age taxonomy; apply to blog + materials.

### Phase 7 — Calendly Google Meet
- [ ] Configure event types to auto-generate Google Meet links in confirmations.

### Phase 8 — Legal finalization (after blocker #2)
- [ ] Fill /terms, /gdpr, /privacy with real entity data; lift DRAFT status.
