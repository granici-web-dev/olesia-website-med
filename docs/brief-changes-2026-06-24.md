# Client brief changes — 2026-06-24

Source: `docs/Бриф проекта — Dr. Olesea Jalba.csv` (client's answers to our questions).
This file is the working plan for implementing those answers. Read it before starting brief work.
Status legend: ✅ ready to do · ⛔ blocked on client · ❓ needs Serghei's decision.

---

## 📌 PICK-UP LIST — what's deferred (as of 2026-06-25)

The **frontend slice of every brief feature is built** (Phases 0–7; see per-phase status below). Branch `feat/responsive-burger-and-architecture`. What remains is grouped here so we can resume fast.

### ⛔ Blocked on the client (can't proceed without their input)
- ~~**Subscription prices**~~ — ✅ RESOLVED 2026-07-01: subscriptions are **on-request** (no price matrix needed). Client lead → doctor contacts directly and sets duration (1/2/3/6 mo) + price. Frontend reframed "Monitorizare 3 luni" → "Monitorizare și abonamente" (4 types, on-request) across landing/pricing/services/faq/terms/nav/i18n. Blocker #1 dropped.
- **Legal entity data + lawyer review** — for /gdpr, /terms, /privacy (Phase 8, blocker #2). Pages are DRAFT.
- **Analytics IDs** — Cookiebot CBID + GTM + GA4 + Meta Pixel + GSC token (Phase 3). Code is env-gated and ready; just set env on Vercel.
- **Newsletter provider + endpoint** — pick Mailchimp/Brevo/Resend/own API (Phase 4, blocker #8). Code env-gated; set `NEXT_PUBLIC_NEWSLETTER_ENDPOINT` (prefer same-origin to dodge CORS).
- **"~1h" SLA confirmation + working hours** (blocker #6) — gates updating the back-office operational 48h countdown (`dueAt`/deadline-indicator). Public copy already says ~1h.
- **Real Calendly event-type API URIs** for `nutrition_copii` / `nutrition_adulti` (webhook routing). Booking buttons already use the scheduling URLs.
- **Calendly links audited + normalized (2026-07-01):** the mapping had scrambled test-clone slugs (nutrition→`pediatrica`, integrative→`nutri-ionala`, pediatric→generic `30min`). Normalized so **each service points to a slug named after it**, consistently across `lib/calendly.ts` + `seed.ts` + back-office `mock.ts`: pediatric→`consulta-ie-pediatrica-clone`, nutrition→`consulta-ie-nutri-ionala-clone`, integrative & free→`consulta-ie-integrativa-monitorizare-clone`, copii/adulti→`...nutritionala-pentru-copii`/`-adulti`. ⚠ **The `designer-nefele` Calendly TRIAL has EXPIRED**, so all of these currently render "This Calendly URL is not valid" in the popup — expected, not a code bug. **Swap all for the client's real (paid) Calendly before launch** (booking won't work until then). Verified in-browser: popup opens, slugs are correct; only the account is unpaid.
- **Calendly dashboard config** — connect host Google account + set Location=Google Meet on each group-A event type (Phase 7). Account-owner action; can't be done in code.
- **Apariții media** — real list of TV/interviews/conferences + logos/links (Phase 5 / §7.4).
- **Final service texts + article texts/images** — via the agreed Google Drive folder (share to designer.nefele@gmail.com). Interim copy is in place.
- **Exact clinic address** (§5).
- **Cookie-consent provider FINAL decision** — Cookiebot wired as interim no-op; revisit at end of build. See [[cookie-consent-deferred]].

### 🎥 Hardcoded client media (2026-07-01) — make editable in the back office later
- **Homepage hero = video** (client-provided). `docs/olesea jalba.mp4` (139 MB) compressed with ffmpeg → `public/assets/olesea-hero.mp4` (900w · H.264 · no audio · **4.4 MB**) + poster `olesea-hero-poster.jpg`. `Hero.tsx` now renders `<video autoplay muted loop playsinline poster>` in the old photo slot (`.video` in `Hero.module.css`, `object-position: center 22%`). Old `olesea-hero.png` no longer referenced. ⚠ **Reduced-motion:** currently always autoplays — add a `prefers-reduced-motion` pause (show poster) in the polish pass.
- **New client photos** from the wfolio gallery (2 picks, 1280×1920, → webp): **Photo A** (white blazer + stethoscope, warm) → `olesea-about.webp` on **/about** intro portrait; **Photo B** (teal suit, seated by window) → `olesea-portrait-2026.webp` on the **service pages** "Despre medic" portraits (pediatrics/nutrition/integrative/monitoring/services). Original `olesea-portrait.webp` restored from git (unused now). NOTE: replacing a same-named asset hits the next/image + browser cache → **use a new filename when swapping images**, not an overwrite.
- All three are **hardcoded to show + get client approval**; the plan is to make hero media + portraits editable from the back office (media module) in the backend pass.

### 🛠️ Deferred to the BACKEND pass (our work; needs apps/api + back-office)
- **Data-driven catalog** (decided option A): services as DB rows the back office can edit/add (§10). Currently `code` is a fixed enum.
- **Nutrition full split** into two catalog codes (`nutrition_copii`/`nutrition_adulti`) → separate /pricing rows + homepage/services tiles + landing pages + Prisma migration. (Frontend uses 1 service + 2 booking buttons for now.)
- **Group C catalog modeling** + `ServiceGroup` C + dedicated order form/upload + delivery flow (§2). Frontend now has a **per-product order popup** on /pricing (each "Comandă" opens `LeadFormModal` in deliverable mode; posts `{name,email,phone,message,product,productTitle}` to **`/leads/deliverable`** via `submitDeliverableLead`). **Backend still owes:** the `/leads/deliverable` endpoint + a Prisma model (e.g. `DeliverableOrder`) + a back-office "Comenzi/Orders" view so the lead shows the exact product ordered. Until then, the frontend submit will error (endpoint 404) like the other lead forms without the API.
- **Subscriptions** 4×4 structure in the model (once prices unblocked).
- **Biblioteca Digitală backend**: `materials` API module + back-office CRUD + real PDFs + paid-download flow + newsletter persistence (Phase 2). (Frontend storefront + email-gate built on local data.)
- **Age tagging** on `posts` + `materials` API models so live content carries ages (Phase 6). (Frontend filter + shared taxonomy done.)
- **Calendly → store/show Meet link** from the webhook `location` payload when the appointments module lands (Phase 7).
- **Operational 48h→~1h SLA** (`dueAt`/deadline-indicator) once blocker #6 confirmed.

### 🟢 Small/optional frontend leftovers
- ~~**Services slogan** (CSV row 371)~~ — ✅ DONE 2026-07-01 (quote band on /services, trilingual).
- **/gdpr cookie section** — name the GA4/GTM/Pixel cookies once the tools are confirmed.
- **"Cum decurge colaborarea"** section — skipped (duplicates homepage HowItWorks); build only if the client wants a distinct block.

### LOW review items intentionally NOT done
All HIGH/MED review findings fixed. Remaining LOW were addressed in commit `b478522` **except**: GTM-vs-GA4 double-count is documented (not enforced) since only one ID will be set.

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
- [x] Rename quick_question → "Întrebare EXPRESS", SLA 48h→~1h (public copy), email/WhatsApp delivery, disclaimers (commit `a007e20`). **+2026-07-01:** completed the §Q3 content on the landing — added the **"Exemple de întrebări"** section (8 example requests from the brief), the **"answer based solely on submitted info"** disclaimer, and enriched "Ce primești" with brief's "ce include" items (guidance on next steps, suggestion of further tests / full consult). Trilingual. Page now fully matches brief §Q3.
- [~] **Split `nutrition` → copii / adulti.** PARTIAL (commit `3e5b06e`) — chose the **contained frontend approach**: 1 catalog service "Consultație nutrițională", two audience-specific Calendly events surfaced as two booking buttons on /nutrition (`Programează · copii` / `· adulți`). Same 60min/38€. Client supplied two dedicated, non-colliding Calendly events:
  - copii → `…/consultatie-nutritionala-pentru-copii`
  - adulti → `…/consultatie-nutritionala-pentru-adulti`
  - URLs in `apps/frontend/lib/calendly.ts` (`nutrition_copii` / `nutrition_adulti`).
  - **Still deferred (backend pass):** full catalog split into two codes (`nutrition_copii`/`nutrition_adulti`) = separate /pricing rows + homepage/services tiles + landing pages + shared/Prisma enum + migration + back-office. And the real `event_type` API URIs (`api.calendly.com/event_types/<uuid>`) for webhook routing — the booking buttons use scheduling URLs only; backend mapping needs the UUIDs.
- [~] **Add group C deliverables:** 3 menus (7/14/30 → 28/48/88€) + 2 protocols (98€). PARTIAL (commit `3d74f08`) — surfaced as a **"Livrabile" section on /pricing** (local array, trilingual), ordering → /contact (manual interim). Prices final, copy interim (client texts pending). **Still deferred (backend pass):** `ServiceGroup` C + catalog modeling + dedicated order form/upload + delivery flow.
- [x] **Restructure subscriptions:** ✅ 2026-07-01 — decided **on-request** model (no price matrix). "Monitorizare 3 luni" reframed → **"Monitorizare și abonamente"**: 4 types (Pediatrie / Nutriție copii / Nutriție adulți / Complex) shown as text, durations 1/2/3/6 luni as chips, price "la cerere". One lead form ("Solicită un abonament") → doctor contacts client and sets duration + price directly. Applied across `monitoring/page.tsx` (landing + new "Tipuri" section + flow), `pricing/page.tsx`, `services/page.tsx` (tile + compare matrix), `service-content.ts`, `faq/page.tsx`, `terms/page.tsx`, `integrative/page.tsx` cross-links, nav/home/footer/leadForm i18n (ro/en/ru). **Backend pass still owes:** the 4×4 structure in the Prisma model + back-office (frontend is copy-only for now).
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

### Phase 3 — Analytics — 🟡 INFRA DONE 2026-06-25 (commit `01640b4`)
- [x] GTM + GA4 + Meta Pixel + Search Console verification — **env-gated** infra (`lib/analytics.ts`, `components/analytics/`). No-op until IDs set. Wire IDs via env: `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_GSC_VERIFICATION`.
- [x] Cookie/consent banner (GDPR) — **Cookiebot CMP wired as the interim default** (env-gated, no-op without CBID), but the **provider is NOT finalized**. ❓ DECISION DEFERRED to end of build (2026-06-25): pick between (A) self-hosted open-source CMP (CookieConsent v3 / Klaro, free), (B) upgraded self-built banner + consent log, (C) keep Cookiebot (paid). Lawyer signs off — extra weight because the site handles **health data** (special category). Whichever is chosen, the tracker-gating wiring (statistics→GTM/GA4, marketing→Pixel) stays. Verified for Cookiebot: script injects, GTM does not load pre-consent.
- [x] Events wired: `booking_click` (Calendly), `lead_open` + `lead_submit` (group-B + contact form), `material_download` (library email-gate). Push to dataLayer/gtag/fbq.
- [ ] ⛔ **Client to provide:** **Cookiebot account + CBID** (paid plan — they shared pricing), GTM container + GA4 + Pixel IDs + GSC token. Then set env on Vercel.
- [ ] Update /gdpr cookie section to name GA4/GTM/Pixel cookies (after tools confirmed; page already DRAFT pending lawyer).

### Phase 4 — Newsletter — 🟡 INFRA DONE 2026-06-25 (commit `477da4a`)
- [x] **Signup component + subscribe() infra**, env-gated like analytics (`lib/newsletter.ts`, `components/ui/NewsletterSignup.tsx`). Hidden until `NEXT_PUBLIC_NEWSLETTER_ENDPOINT` is set; POSTs `{email, locale, source, consent}`; fires `newsletter_subscribe` analytics event. In the footer (gated) + the library email-gate now doubles as opt-in. Browser-verified (hidden by default; appears + validates + POSTs when configured).
- [ ] ⛔ **Pick provider + endpoint** (blocker #8 — no SMTP/list yet). Note: prefer a **same-origin** endpoint (our API/serverless proxy) over a direct provider URL to avoid browser CORS. Then set env on Vercel.

### Phase 5 — Content sections (after client texts) — 🟡 PARTIAL 2026-06-25 (commit `d456c4a`)
- [x] **De ce să lucrezi cu mine** (7 reasons), **Valori profesionale**, + 2 italic philosophy quotes — added to /about with the client's exact RO text + EN/RU translations.
- [ ] **Cum decurge colaborarea** — skipped (duplicates the homepage "Cum funcționează" / HowItWorks 4-step section). Revisit if the client wants a distinct collaboration-flow block.
- [x] **Diplome, certificări** — /about Curriculum section covers text; **+2026-07-01** added a visual **"Certificări recente"** section (`components/sections/Certificates.tsx` + `.module.css`) after Curriculum: 2 training certificates (Pediatric Feeding Difficulties Program 39h; Bottle Aversion in Infants 1h) as framed document thumbnails → lightbox (reuses `Modal`, a11y/Escape/focus). Images in `public/assets/cert-*.jpg`. Trilingual, browser-verified. **Honesty note:** the certs' partner-institution logos (Stanford/UNICEF/Ludwig-Maximilians/etc.) carry an explicit "not an endorsement/accreditation" disclaimer, so they are NOT re-surfaced as trust badges — only course title/issuer/hours/date + the document image itself. **Optional follow-up:** could also surface the feeding certs on /nutrition + the complementary-feeding protocol (directly relevant) — not built yet.
- [ ] ⛔ **Apariții media** — blocked: brief lists categories (TV/interviews/conferences/projects) but no actual appearances. Build when the client sends the real list (+ logos/links).
- [x] Services slogan (CSV row 371) — ✅ 2026-07-01: placed as a centered first-person quote band on /services (between hero and the choice helper), trilingual (RO original + EN/RU).

### Phase 6 — Age filter — ✅ FRONTEND DONE 2026-06-25
- [x] Shared age taxonomy `apps/frontend/lib/age-taxonomy.ts` (built in Phase 2).
- [x] Applied to **materials** (Phase 2 library) and **blog** (commit `27a7620`): posts tagged with `ageKeys` (empty = all ages); `BlogList` gained an age-filter row combined with the category filter; /articles shows only age groups present in the listing. Browser-verified.
- [ ] Backend: add age tagging to the `posts` + `materials` API models so live content carries ages (deferred — backend pass; live posts currently pass `ageKeys: []`).

### Phase 7 — Calendly Google Meet — 🟡 FRONTEND DONE 2026-06-25 (commit `f08b81e`)
- [x] **Frontend copy** sets expectations (brief §9): FAQ "Cum decurge o consultație online?" + homepage "how it works" now say the consult runs on **Google Meet** (link auto-sent in confirmation), with WhatsApp/Viber/Instagram video on request. Fixed stale 50→30 min duration too. **+2026-07-01:** extended the same Google Meet + alt-channel copy to the "Apel video" step on all 3 consultation landings (pediatrics/nutrition/integrative), trilingual. Also fixed 2 stale "Monitorizare 3 luni" refs in the integrative FAQ → "abonamentele de monitorizare (1–6 luni)".
- [ ] ⛔ **Client/account-owner config (in Calendly dashboard — cannot be done in code):**
  1. Connect the host **Google account** to Calendly (Account → Connect → Google Calendar/Meet).
  2. For each group-A event type (pediatric, nutrition copii, nutrition adulti, integrative, free consult), set **Location = Google Meet**.
  3. Calendly then auto-creates the Meet link and includes it in the confirmation email + calendar invite — no code needed.
- [ ] Backend (deferred): when the appointments module lands, persist/display the Meet link from the Calendly webhook `location` payload.

### Phase 8 — Legal finalization (after blocker #2)
- [ ] Fill /terms, /gdpr, /privacy with real entity data; lift DRAFT status.
