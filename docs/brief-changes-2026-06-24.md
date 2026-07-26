# Client brief changes — 2026-06-24

Sources:
- `docs/Бриф проекта — Dr. Olesea Jalba.csv` — client's answers, round 1 (2026-06-24) → §0–§10.
- `docs/questions.md` — our first question list with her inline answers.
- `docs/questions_v2.md` (internal RU checklist) + **`docs/response_v2.md`** — client's answers, round 2 (**2026-07-26**) → **§11**.

This file is the working plan for implementing those answers. Read it before starting brief work.
Status legend: ✅ ready to do · ⛔ blocked on client · ❓ needs Serghei's decision.

---

## 📌 PICK-UP LIST — what's deferred (as of 2026-07-26)

The **frontend slice of every brief feature is built** (Phases 0–7; see per-phase status below). Branch `feat/responsive-burger-and-architecture`. What remains is grouped here so we can resume fast.

⚠️ **Read §11 "Client answers v2 (2026-07-26)" before planning the backend pass** — that round adds online payments, patient document upload, a security package and several new back-office modules. The scope below is already updated for it.

### ⛔ Blocked on the client (can't proceed without their input)
- ~~**Subscription prices**~~ — ✅ RESOLVED 2026-07-01: subscriptions are **on-request** (no price matrix needed). Client lead → doctor contacts directly and sets duration (1/2/3/6 mo) + price. Frontend reframed "Monitorizare 3 luni" → "Monitorizare și abonamente" (4 types, on-request) across landing/pricing/services/faq/terms/nav/i18n. Blocker #1 dropped.
- ~~**Calendly paid account**~~ — 🟡 COMMITTED 2026-07-26 (answer v2 §1): client will buy a subscription plan. Still **pending delivery** of the real account: swap every `designer-nefele` URL + capture the real `event_type` API URIs.
- ~~**Lawyer review blocks launch**~~ — ✅ UNBLOCKED 2026-07-26 (answer v2 §2): client accepts **standard drafts for launch**, lawyer review comes after. Legal-entity data (name, IDNO/reg. number, address, data controller) is **still required** to remove placeholders → stays blocker #2 (reduced severity).
- ~~**"~1h" SLA confirmation**~~ — ✅ CONFIRMED 2026-07-26 (answer v2 §5): ~1h **during working hours**; requests outside hours are answered in the next working interval. ⛔ **Still missing: the actual `program de lucru`.** Operational countdown must become **business-hours-aware**, not `+1h` (see §11.5).
- ~~**Final service texts**~~ — 🟡 client reviews them herself before launch and sends edits (answer v2 §4). Interim copy stays; add to the pre-launch checklist.
- ~~**Hardcoded hero video + portraits**~~ — ✅ approved as interim (answer v2 §3); client expects to swap them **from the back office** later → confirms the site-media module (§11.12).
- **Legal entity data** — for /gdpr, /terms, /privacy (Phase 8, blocker #2). Pages are DRAFT.
- **Analytics IDs** — Cookiebot CBID + GTM + GA4 + Meta Pixel + GSC token (Phase 3). Code is env-gated and ready; just set env on Vercel.
- **Newsletter provider + endpoint** — pick Mailchimp/Brevo/Resend/own API (Phase 4, blocker #8). Code env-gated; set `NEXT_PUBLIC_NEWSLETTER_ENDPOINT` (prefer same-origin to dodge CORS). Recommendation to put to the client: **Brevo** (one provider for transactional SMTP + newsletter).
- **Working hours (`program de lucru`)** — gates the business-hours SLA logic (§11.5).
- **Payment scope sign-off** — 5 methods requested (§11.8); needs a scope/budget/timeline decision before any code.
- **Medical-data retention + jurisdiction** — now mandatory because of patient document upload (§11.14).
- **Real Calendly event-type API URIs** for `nutrition_copii` / `nutrition_adulti` (webhook routing). Booking buttons already use the scheduling URLs.
- **Calendly links audited + normalized (2026-07-01):** the mapping had scrambled test-clone slugs (nutrition→`pediatrica`, integrative→`nutri-ionala`, pediatric→generic `30min`). Normalized so **each service points to a slug named after it**, consistently across `lib/calendly.ts` + `seed.ts` + back-office `mock.ts`: pediatric→`consulta-ie-pediatrica-clone`, nutrition→`consulta-ie-nutri-ionala-clone`, integrative & free→`consulta-ie-integrativa-monitorizare-clone`, copii/adulti→`...nutritionala-pentru-copii`/`-adulti`. ⚠ **The `designer-nefele` Calendly TRIAL has EXPIRED**, so all of these currently render "This Calendly URL is not valid" in the popup — expected, not a code bug. **Swap all for the client's real (paid) Calendly before launch** (booking won't work until then). Verified in-browser: popup opens, slugs are correct; only the account is unpaid.
- **Calendly dashboard config** — connect host Google account + set Location=Google Meet on each group-A event type (Phase 7). Account-owner action; can't be done in code.
- **Apariții media** — ✅ CONFIRMED as a **dedicated page** (answer v2 §6), scope widened: TV **and radio** interviews, conferences, congresses, presentations, **diplomas and certificates**, with photos + links. **Page BUILT 2026-07-26** at `/media` with the first 3 TV appearances (see Phase 5 below). ⛔ still pending from the client: the rest of the list (radio, conferences, congresses, presentations) + the broadcast date of the TVR Moldova piece.
- **Article texts/images** — via the agreed Google Drive folder (share to designer.nefele@gmail.com). Interim copy is in place. (Service texts: client reviews them herself, see above.)
- **Exact clinic address** (§5).
- **Cookie-consent provider FINAL decision** — Cookiebot wired as interim no-op; revisit at end of build. See [[cookie-consent-deferred]].

### 🎥 Hardcoded client media (2026-07-01) — make editable in the back office later
- **Homepage hero = video** (client-provided), source `docs/olesea jalba.mp4` (139 MB, 1080×1920) + poster `olesea-hero-poster.jpg`. ⚠️ **Superseded 2026-07-26 — see §11.7:** the hero is click-to-play **with sound** (not an autoplay muted loop), and the asset is now **three locale encodes with burned-in subtitles** (`olesea-hero-{ro,en,ru}.mp4`, ~5.5 MB each). The old silent/`-sound` files are gone. The reduced-motion note no longer applies — nothing autoplays.
- **New client photos** from the wfolio gallery (2 picks, 1280×1920, → webp): **Photo A** (white blazer + stethoscope, warm) → `olesea-about.webp` on **/about** intro portrait; **Photo B** (teal suit, seated by window) → `olesea-portrait-2026.webp` on the **service pages** "Despre medic" portraits (pediatrics/nutrition/integrative/monitoring/services). Original `olesea-portrait.webp` restored from git (unused now). NOTE: replacing a same-named asset hits the next/image + browser cache → **use a new filename when swapping images**, not an overwrite.
- All three are **hardcoded to show + get client approval**; the plan is to make hero media + portraits editable from the back office (media module) in the backend pass.

### 📥 Incoming client materials (2026-07-26) — received, not yet used on the site
- **`docs/testemonials.md`** — first 2 real reviews (1 RU unsigned · 1 RO signed "Zlobin Alexandru", via the **DoctorChat** platform). ✅ **LIVE 2026-07-26:** the 6 fabricated placeholder reviews were deleted and these two took their place (`LOCAL_TESTIMONIALS` in `Testimonials.tsx`); the slider went **3-up → 2-up** (1 on mobile) and hides its arrows when everything fits. Each review is stored trilingual — the two non-original locales are faithful translations, wording otherwise untouched; the unsigned one shows a neutral author label, not an invented name. ⛔ Ask the client for more reviews, and whether DoctorChat requires a formal source credit.
- **`docs/Certificat 000833 J.O.pdf`** — **WHO Basic Emergency Care Provider Course**, cert. BMP 000833, Jalba Olesea, **09.07.2026**, issued by the WHO Regional Office for Europe via the WHO Country Office in Moldova (signed by Dr Miljana Grbić, WHO Representative), under the "Strengthening the Emergency Care System in the Republic of Moldova" project.
  ⚠️ **DO NOT publish the certificate image or the WHO logo on the site.** The document itself states: *"the Recipient agrees not to use this Certificate and/or the Recipient's participation … for any promotional, publicity or commercial purposes"*, and that it implies no WHO approval/endorsement. A commercial practice site is exactly that use. **Safe option:** a plain factual line in the /about *Curriculum* text ("Curs WHO Basic Emergency Care Provider, 2026") — no logo, no document scan, no badge. Get the client's (and ideally the lawyer's) explicit OK even for that. This is stricter than the existing "Certificări recente" block, whose certs only carried a no-endorsement note.
- **3 TV appearances — first real `apariții media` items.** Local recordings sit in `docs/` (**git-ignored**, 40 / 33 / 164 MB) as an archive only; the site must **embed / link the original publication**, never self-host (12–14 min each, low-res copies, broadcast rights belong to the channel). Publication URLs received 2026-07-26 and verified via oEmbed/OG metadata:

  | Title | Channel / page | Link | Local file |
  |---|---|---|---|
  | Medicul pediatru Olesea Jalba, la Moldova 1 | **Teleradio Moldova** (Moldova 1), YouTube `@TRMMDChannel` | `https://www.youtube.com/watch?v=U3PhOZMC-6o` | 13:19 · 640×360 |
  | Gripa sezonieră. Pe cine afectează, cum prevenim boala, primele simptome și care sunt riscurile | **TELEMAGAZIN MOLDOVA** (Canal 2), YouTube `@TelemagazinCanal2` | `https://www.youtube.com/watch?v=NxqYFNuPqbE` | 11:56 · 640×360 |
  | Zilele toride pot fi periculoase pentru cei mici (insolație la copii) | **TeleMATINAL**, Facebook Watch | `https://www.facebook.com/watch/?v=2859077347632258` | 13:44 · 1280×720 |

  ✅ **Shipped 2026-07-26** — see Phase 5 "/media page" below for what was built. Decisions baked in:
  - YouTube embeds use **`youtube-nocookie.com`**; Facebook Watch has **no privacy-friendly embed** variant, so its plugin iframe is only ever loaded on demand.
  - Embeds are **click-to-load**: the poster is a button, the iframe mounts on press. Verified in-browser — **zero requests to youtube/ytimg/facebook before the click**, provider requests only after. This is what keeps the page honest against the Accept-all/Reject/Customize banner the client asked for (answer v2 §9).
  - Thumbnails are **self-hosted** in `public/assets/media/` (`yt-<videoId>.jpg`, `fb-<videoId>.jpg`) — Facebook's `og:image` URLs are signed and expire, and hot-linking ytimg would re-add the pre-consent third-party request.
  - Dates were recovered from the publications themselves (YouTube `uploadDate`): Moldova 1 → April 2023, Canal 2 → December 2022. **The Facebook/TVR Moldova one has no public date — ask the client.**
  - Summaries are ours, written from the on-screen topic (nobody watched the full 12–14 min). Worth a client read-through.
  - `.gitignore` now excludes `docs/*.mp4` wholesale (a 164 MB file would be rejected by GitHub's 100 MB limit and would bloat history permanently).

### 🛠️ Deferred to the BACKEND pass (our work; needs apps/api + back-office)
- **Data-driven catalog** (decided option A): services as DB rows the back office can edit/add (§10). Currently `code` is a fixed enum.
- **Nutrition full split** into two catalog codes (`nutrition_copii`/`nutrition_adulti`) → separate /pricing rows + homepage/services tiles + landing pages + Prisma migration. (Frontend uses 1 service + 2 booking buttons for now.)
- **Group C catalog modeling** + `ServiceGroup` C + dedicated order form/upload + delivery flow (§2). Frontend now has a **per-product order popup** on /pricing (each "Comandă" opens `LeadFormModal` in deliverable mode; posts `{name,email,phone,message,product,productTitle}` to **`/leads/deliverable`** via `submitDeliverableLead`). **Backend still owes:** the `/leads/deliverable` endpoint + a Prisma model (e.g. `DeliverableOrder`) + a back-office "Comenzi/Orders" view so the lead shows the exact product ordered. Until then, the frontend submit will error (endpoint 404) like the other lead forms without the API.
- **Subscriptions** 4×4 structure in the model (once prices unblocked).
- **Biblioteca Digitală backend**: `materials` API module + back-office CRUD + real PDFs + paid-download flow + newsletter persistence (Phase 2). (Frontend storefront + email-gate built on local data.)
- **Age tagging** on `posts` + `materials` API models so live content carries ages (Phase 6). (Frontend filter + shared taxonomy done.)
- **Calendly → store/show Meet link** from the webhook `location` payload when the appointments module lands (Phase 7).
- **Operational 48h→~1h SLA**, **business-hours-aware** (`dueAt`/deadline-indicator) once the working hours arrive (§11.5).

#### ➕ Added by client answers v2 (2026-07-26) — see §11 for detail
- **Payments module** (§11.8+§11.11) — online payment inside the booking flow; 5 methods requested. **Reverses the earlier "payments out of scope / manual confirm" decision.** Needs scope sign-off first.
- **Patient document upload** (§11.14) — patients upload analyses/investigations before the consult. New surface, special-category GDPR data, no patient accounts exist today.
- **Security package** (§11.10) — reCAPTCHA on all forms (nothing exists), **admin 2FA/TOTP** (nothing exists), automated DB backups, WAF/rate limiting, dependency-update process.
- **New back-office modules** (§11.12) — FAQ, testimonials, media appearances, PDF materials, site media (hero video + portraits). None exist today.
- **RU fields in content models** (§11.12) — Prisma content models are `*_ro`/`*_en` only while the site is trilingual; if the client edits copy herself, RU must be first-class, not a RO fallback.
- **Video subtitles** (§11.7) — RO audio stays; EN/RU get `.vtt` subtitle tracks. Blocked by a UX decision: the hero video is a muted, control-less autoplay loop where captions can't surface.

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

## 11. Client answers v2 — 2026-07-26 ⚠️ SECOND SCOPE CHANGE

Sources: our checklist `docs/questions_v2.md` (Russian, internal) + the numbered RO questionnaire the client actually answered — her replies are in **`docs/response_v2.md`** (14 points).
⚠️ The RO original of that 14-point questionnaire is **not in the repo** — only her answers. Add it if it resurfaces.

**Headline: online payment is now IN scope and patients must be able to upload documents.** Both reverse/extend earlier decisions. Nothing from this section is implemented yet.

### Point-by-point

| # | Client answer | Effect on us |
|---|---|---|
| 1 | Will buy a **paid Calendly** plan | Blocker downgraded to "waiting for the account". On arrival: swap all `designer-nefele` URLs (`lib/calendly.ts`, `seed.ts`, back-office `mock.ts`) + capture real `event_type` API URIs for webhook routing |
| 2 | Legal pages: **standard drafts are fine for launch**, lawyer reviews later | Launch no longer blocked on a lawyer. Legal-entity data still needed to drop placeholders |
| 3 | Current photos/video OK temporarily; **she will swap them from the admin panel** | Confirms the site-media module (hero video + portraits) is required, not optional |
| 4 | She reviews **service texts** herself before launch | Move to pre-launch checklist; keep interim copy |
| 5 | **EXPRESS SLA:** ~1h **during working hours**; off-hours → next working interval; schedule to follow | Public copy must add the "în timpul programului" qualifier (RO/EN/RU). Operational `dueAt` must become **business-hours-aware** (not `now + 1h`) — needs the schedule |
| 6 | Wants a **dedicated media page**: TV **+ radio**, conferences, congresses, presentations, **diplomas & certificates**, photos + links | New `/media` route (doesn't exist) + CRUD. Decide whether the existing /about "Certificări recente" block moves there or is duplicated |
| 7 | RO/EN/RU; **no AI dubbing** — RO audio + **subtitles** for EN/RU; dubbing only if international demand appears | Cheaper than our estimate, but see §11.7 — captions need a player that can show them |
| 8 | Payment methods: **card (Visa/MC), MIA, Revolut, PayPal, SEPA** | See §11.8 — biggest item |
| 9 | Cookie banner with **Accept all / Reject / Customize** | Kills the no-op interim: a real CMP with granular categories is required. Cookiebot free tier covers this; the provider decision (Phase 3) can now be closed on that basis |
| 10 | Security: SSL, **reCAPTCHA**, automatic backups, "automatic updates", attack protection, **admin 2FA** | See §11.10 — 5 of 6 don't exist |
| 11 | Booking flow: service → date/time → **pay online** → automatic confirmation with all consultation info | Couples payments to booking; also needs working transactional email (still no SMTP) |
| 12 | Wants to edit herself: texts, prices, photos, articles, PDF guides, **FAQ**, **testimonials**, **media appearances** | See §11.12 — several missing back-office modules |
| 13 | Blog **and** newsletter confirmed | Provider still unnamed → blocker #8 stands. Recommend **Brevo** (covers SMTP + newsletter in one) |
| 14 | Mobile + SEO + GA4 + GSC; **plus: patients upload analyses/investigations before the consult** | Analytics only needs IDs. The upload is a new feature → §11.14 |

### 11.7 Video subtitles — ✅ DONE 2026-07-26 (burned in, one encode per locale)
Decision (Serghei): **burn the subtitles into the picture**, not `<track>`. Burned-in survives muted playback, scrubbing and every mobile player, and needs no controls of its own.

⚠️ Correction to the note in the PICK-UP LIST above: the hero is **not** an autoplay muted loop. `HeroVideo.tsx` renders a click-to-play video **with sound** and a play/pause button; the asset was `olesea-hero-sound.mp4` (900×1600 · 43.5s · H.264 + AAC).

What was produced:
- `public/assets/olesea-hero-{ro,en,ru}.mp4` — one encode per locale, subtitles burned in, ~5.5 MB each; `HeroVideo.tsx` picks by locale (`VIDEO_BY_LOCALE`, RO as fallback). `olesea-hero-sound.mp4` deleted (superseded).
- **Animated (2026-07-26, second pass):** the static burn-in was replaced by a **Remotion** render — same cues, same placement, but each phrase now fades and rises in and quietly fades out. Decisions behind it: (a) the scaffold's `--tiktok` template look (uppercase, green word highlight, heavy stroke) was rejected as wrong for this site; the shipped style is Manrope 600 / cream on an ink pill, sentence case. (b) **Phrase-by-phrase, not word-by-word** — whisper only gives word timings for the Romanian audio, so per-word highlighting on the EN/RU translations would be invented timing. (c) The template's default position sits in the cropped-away zone; ours is raised to clear it. ⚠️ **Remotion licensing: free only for teams of up to 3 — a company needs a paid licence (remotion.pro/license). Check before this becomes part of the delivered pipeline.** Project lives in the session scratchpad (`subs-demo`), not in the monorepo.
- **Transcript:** `whisper-cli` (large-v3-turbo, `-l ro -ml 40 -sow`) over the audio of the 139 MB original. Hand-corrected: *Olesia→Olesea*, *medic-pediatru→medic pediatru*, *minținerea→menținerea*, *profesionalii→profesionalism*. EN/RU are faithful translations on the same timings.
- **Rendering:** the Homebrew ffmpeg build here has **no libass and no drawtext**, so the `subtitles`/`ass` filter is unavailable. Instead each cue is rendered to a transparent PNG by **headless Chrome** in the site's own type (Manrope 600, cream on a soft ink band) and burned in with timed `overlay` filters. Working files: `scratchpad/{cues.json,render-cues.js,burn.js}`.
- **Placement is not the frame bottom.** The hero is a 4/5 frame with `object-fit: cover; object-position: center 22%`, so only y≈104…1229 of the 1600px-tall video is ever visible — subtitles sit at y≈900–1192. Re-cut the video or change that CSS and the placement must be re-checked.
- Lines are hand-wrapped to ≤34 characters at 40px so they stay legible when the hero shrinks to ~354px on mobile.

Still open: the `prefers-reduced-motion` question is moot for autoplay (there is none), and the client may want to re-check the RO wording against what she actually said.

### 11.8 + 11.11 Online payments — ⚠️ reverses an earlier decision, needs sign-off
**Contradiction on record:** `docs/questions.md` answers 17–18 said *"подтверждение вручную в портале"* and *"онлайн-оплату — нет"*; `module_calendly.md` states **"Payments: out of scope — manual"**; Prisma carries `paymentStatus: pending → confirmed` set by hand; decision #3 of 2026-06-24 made paid downloads manual for the same reason. Answer v2 §11 now requires **pay online before the slot is confirmed**.

Implications:
- **New `payments` module**: provider integration, checkout, webhooks, idempotency, refunds, receipts, reconciliation with `paymentStatus`; booking flow reworked so payment precedes Calendly confirmation (custom checkout → then Calendly, or Calendly's native payment collection).
- **Calendly's native payments = Stripe / PayPal only**, and **Stripe does not onboard Moldovan merchants** → Calendly-native realistically means PayPal only.
- **Five methods ≠ one integration.** Card + MIA = a Moldovan acquirer (maib / Victoriabank / Paynet — MIA is the BNM instant-payment scheme, exposed through banks/PSPs). SEPA = a bank transfer by IBAN → **no automatic confirmation** unless a bank API is added; realistically stays manual. PayPal and Revolut merchant availability for a Moldovan entity **must be verified with the provider before being promised** — do not assume.
- **Suggested MVP** to put to the client: one Moldovan acquirer (card + MIA, auto-confirm) + PayPal for foreign patients; SEPA shown as IBAN details with manual confirmation; Revolut only if a merchant account is actually obtainable.

**📎 Reference the client sent (2026-07-26): `docs/telegram-cloud-photo-size-2-5400158683477515871-y.jpg`** — a competitor's "ask the doctor" checkout (*"Dr. Petrache va raspunde"*, general medicine + diabetes, **answer within max 30 minutes**, price per single question, "after payment follow the instructions"). What it actually shows:
- The page is **`buy.stripe.com` — a Stripe Payment Link**: a hosted checkout with no integration work at all. Payment methods: **Stripe Link**, card (Visa/Mastercard/Amex/UnionPay), plus email + phone collected at checkout.
- Prices are offered in **RON 25,00 or MDL 102,58**, with "1 RON = 4,1032 MDL (include taxa de conversie 4 %)" — i.e. **the base currency is RON**, MDL is a converted presentment currency. That points to a **Romanian merchant entity**; Stripe does not onboard Moldovan ones.
- ⇒ **The decisive question is our client's legal entity** (blocker #2, still unanswered). A **RO entity makes Stripe available**, which collapses most of the payments work: Payment Links for a v1, Checkout + webhooks later, one integration covering card/Link/Apple Pay/Google Pay. A **Moldova-only PFA/SRL rules Stripe out** and puts us back on a local acquirer.
- Even with Stripe, **MIA is not covered** — that always needs a Moldovan bank/PSP. So her five-method wish list can't come from a single provider either way.
- Flow implication for EXPRESS: the reference is **pay first → then submit the question**, with post-payment instructions. Ours is the reverse today (lead form → manual follow-up). See §11.4b.
- Also affects **paid library materials** (decision #3) and **group C deliverables** — same checkout once it exists.
→ **Do not start coding before scope/budget/timeline are agreed.**

### 11.4b Întrebare EXPRESS — the flow the client is aiming at
Her reference (see §11.8) sells a single question as a **product bought up front**: pick currency → pay on a hosted checkout (email + phone captured there) → follow the instructions to send the question → answer within a stated SLA.

Ours today: `BookGroupBButton` → `LeadFormModal` → `POST /leads` → the doctor follows up manually; payment is confirmed by hand in the back office. To match the reference we'd need:
- **Order reversed** — pay, then the question form (or the form, then a checkout that gates delivery). Decide which; "pay first" is what she showed us.
- **A post-payment instructions page + email** (this is where the question form lives).
- **The paid record created automatically** from the payment webhook, so `QuickQuestion` starts at `payment_status: confirmed` and the SLA clock starts at payment.
- **Currency presentation:** catalog is EUR (8 EUR); the reference shows MDL + RON with an explicit FX-fee note. Ask whether she wants a local-currency display.
- Cheapest possible v1 if Stripe turns out to be available: a **Payment Link per product**, no integration — but then nothing is automated, exactly like today. The automation only arrives with Checkout + webhooks.

### 11.10 Security package — 5 of 6 items don't exist
| Requested | Reality (checked 2026-07-26) |
|---|---|
| SSL | ✅ automatic on Vercel; API depends on the (undecided) prod host |
| Google reCAPTCHA | ❌ **no captcha anywhere in the repo**. Needed on: contact form, lead forms, EXPRESS, library email-gate, newsletter. (Turnstile would be the better tool, but she named reCAPTCHA.) |
| Automatic backups | ❌ depends on prod Postgres hosting (question 28, unanswered). A managed Postgres with PITR satisfies it |
| "Automatic updates" | ⚠️ WordPress-shaped expectation. Our equivalent = Dependabot/Renovate + a periodic upgrade pass. **Explain this to her so expectations match** |
| Attack protection | ❌ add Vercel WAF/rate limiting + API throttling |
| Admin 2FA | ❌ auth is JWT + password only (`apps/api/src/app/auth`). Needs TOTP + recovery codes + back-office enrolment UI |

### 11.12 Back-office coverage vs what she expects to edit
Existing back-office pages: `about, appointments, blog, contacts, dashboard, messages, patients, quick-questions, services, subscriptions, users`.
**Missing for her list:** FAQ · testimonials · media appearances · PDF materials (Biblioteca) · site media (hero video + portraits) — plus the already-planned data-driven catalog for prices/texts.
Note: homepage testimonials are currently **hardcoded fakes** ([[testimonials-placeholder]]) — once a CRUD exists they must be replaced with real reviews before launch.
**Localisation gap:** `Service` (and the other content models) are `titleRo/titleEn`, `descriptionRo/descriptionEn` — **no RU**, while the site ships RO/EN/RU. If she authors content herself, RU has to become a real field across services/blog/about/FAQ/testimonials/materials, otherwise the Russian site silently falls back to Romanian forever.

### 11.14 Patient document upload — new feature, special-category data
Requested: patients upload analyses/investigations/documents **before** the consultation. Today the portal is staff-only (`admin`/`editor`); there is no patient login.
- **(A, recommended)** tokenised upload link in the confirmation email, scoped to one appointment, expiring — no accounts.
- **(B)** full patient portal with accounts — a different project in size.
Non-negotiables either way: explicit consent, retention period, EU-region storage, file type/size limits, malware scanning, PII-safe logging, deletion path. This makes `questions.md` #26 (retention, jurisdiction) **mandatory**, not nice-to-have. Overlaps the group-C / subscription upload flows (§2, §3) — build one upload primitive, reuse it.

### Still unanswered after this round
Promised by her: working hours · media-appearance list · new project email · social links · Calendly access.
Never answered: legal-entity data + data-controller contact · medical-data retention/jurisdiction · newsletter provider · domain · prod hosting for API + Postgres · mail domain (SPF/DKIM) · real portal accounts · target launch date · payment scope/budget sign-off.

---

## Blockers — ask the client ⛔ (Russian, ready to forward)

1. ~~**Цены подписок (Abonamente).**~~ ✅ снят 2026-07-01 — модель «по запросу», матрица цен не нужна.
2. **Юр. данные.** Форма (PFA/SRL/физлицо), официальное название, рег. данные, юр. адрес + контакт контроллера данных — для /terms, /gdpr, /privacy. Юрист больше не блокирует запуск (ответ v2 §2), но плейсхолдеры без этих данных не убрать.
3. ~~**Финальные тексты услуг.**~~ 🟡 снят 2026-07-26 — клиент проверяет тексты сама перед запуском и пришлёт правки (ответ v2 §4). Остаётся пунктом пред-запускного чеклиста.
4. **Тексты статей + картинки** к запуску: сколько статей и когда. **Ответ клиенту по каналу загрузки: Google Drive** (решено 2026-06-24) — попросить расшарить одну общую папку (тексты в Google Docs + изображения), доступ на designer.nefele@gmail.com.
5. **Точный адрес клиники** — показывать ли на сайте, и какой.
6. ~~**Подтверждение «~1 час»**~~ ✅ подтверждено 2026-07-26 (ответ v2 §5). ⛔ **Остаётся: рабочие часы (program de lucru)** — от них зависит и публичная формулировка, и business-hours-логика дедлайна.
7. **Тексты для секций** Q17 + фото + **список медиа-появлений** (ТВ/радио/конференции/конгрессы/презентации/дипломы + фото и ссылки — страница подтверждена, ответ v2 §6).
8. **Newsletter/Email:** будет ли почтовый домен/SMTP и какой провайдер рассылки — без этого email-gate библиотеки, рассылки **и автоматическое письмо-подтверждение записи (ответ v2 §11)** не запустить. Наша рекомендация клиенту: **Brevo** (SMTP + рассылки в одном).
9. ~~**Платные материалы библиотеки: ручная оплата или онлайн?**~~ ✅ отвечено косвенно 2026-07-26 — клиент хочет **онлайн-оплату** (§11.8). Теперь вопрос не «нужна ли», а объём/бюджет.

**Новые блокеры после ответов v2 (2026-07-26):**

10. **Онлайн-оплата — подтверждение объёма.** Это расширение ТЗ относительно ответов 17–18 (ручная оплата) и `module_calendly.md`. Нужно: приоритет методов, согласие на сроки/бюджет, реквизиты юрлица для эквайринга. Пять методов = минимум три интеграции; PayPal/Revolut для молдавского юрлица **надо проверять фактически**, а не обещать.
11. **Загрузка документов пациентом** — подтвердить вариант (A) «ссылка из письма без регистрации» vs (B) кабинет пациента.
12. **Медданные:** срок хранения загруженных анализов/вложений, юрисдикция, текст согласия. Раньше был вопрос №26 «на потом» — теперь обязательный.
13. **Хостинг и домен:** финальный домен, где живут API + Postgres в проде (нужно и для автобэкапов из §11.10), почтовый домен + SPF/DKIM.
14. **Учётки портала** (реальные admin/editor + на какие email) и **дата запуска**.

---

## Decisions — RESOLVED with Serghei (2026-06-24) ✅

1. **Catalog = data-driven NOW (option A).** Services become DB rows managed in back office (code, group, title_ro/en, description, price_eur, duration, active). Frontend/pricing reads `/api/services`. Calendly maps `event_type_uri → service_id`. Keep a stable internal `code` for the Calendly mapping. Phase 1 builds this, not the hardcode shortcut.
2. **Biblioteca Digitală = full module NOW.** API `materials` (category, age, free/paid, file, flags) + back-office CRUD + storefront (search, age/topic filter, email-gate, featured/popular/new). Migrate the `/guides` stub into it.
3. **Paid downloads = manual payment confirm** — reuse existing `payment_status` pending→confirmed flow (no payment provider). File access granted after manual confirmation. (No online payment for now.) ⚠️ **SUPERSEDED 2026-07-26** by answer v2 §8/§11 (online payment requested). Manual confirm stays the interim behaviour until the payments scope is signed off (§11.8) — then paid downloads reuse the same checkout.
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
- [x] **Apariții media → `/media` page** — ✅ BUILT 2026-07-26 with the client's first 3 TV appearances (Moldova 1 · Canal 2 · TVR Moldova).
  - `app/[locale]/media/page.tsx` — hero (count + outlets), gallery, rights note ("materials belong to the broadcasters"), press-contact band, consultation CTA. Trilingual, SEO metadata per locale.
  - `components/sections/MediaGallery.tsx` + `.module.css` — responsive card grid (1 col → 2 from `md`), 16:9 well, **click-to-load** embeds, `media_play` analytics event, outlet/runtime chips, permanent outbound link per card (also the fallback when Facebook's plugin refuses to render for logged-out visitors).
  - `lib/media-appearances.ts` — local trilingual data (moves to the back-office `media-appearances` module in the backend pass).
  - Footer → Resurse gains "Apariții media" (`footer.resources.media` in ro/en/ru); `/about` gains a teaser band linking to `/media` after the certificates section.
  - Verified in-browser: RO/EN/RU render, no horizontal overflow at 390 px, YouTube + Facebook embeds both load on click and only on click.
  - ⛔ Still owed by the client: the rest of the list (radio, conferences, congresses, presentations, diplomas), the TVR Moldova broadcast date, and a read-through of our interim summaries.
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
- [ ] Fill /terms, /gdpr, /privacy with real entity data; lift DRAFT status. (Lawyer review moved to post-launch per answer v2 §2 — launch on the standard drafts.)

---

## TODO — phases added by client answers v2 (2026-07-26)

All of these are **not started**. Ordered by dependency, not by client priority.

### Phase 9 — Security package (§11.10)
- [ ] **reCAPTCHA** (client explicitly named Google reCAPTCHA) on contact form, lead forms, EXPRESS, library email-gate, newsletter → client-side widget + server-side token verification in `apps/api` (one guard/interceptor, not per-controller copies). Needs site/secret keys from the client's Google account.
- [ ] **Admin 2FA (TOTP)** in `auth`: enrolment (QR), verification step in the login flow, recovery codes, back-office UI. Enforce for `admin`, offer for `editor`.
- [ ] **Rate limiting / WAF**: throttle auth + public POST endpoints; enable Vercel firewall rules on the frontend.
- [ ] **Automated backups** — falls out of the prod Postgres choice (blocker #13); pick a managed provider with PITR and document the restore procedure.
- [ ] **Dependency updates** — enable Renovate/Dependabot + a documented periodic upgrade pass. Explain to the client that this is what "actualizări automate" means here.

### Phase 10 — Back-office content modules (§11.12)
- [ ] `faq` module + CRUD (frontend /faq is hardcoded copy today).
- [ ] `testimonials` module + CRUD; **replace the hardcoded fake reviews on the homepage** before launch ([[testimonials-placeholder]]). 📥 **First real reviews arrived: `docs/testemonials.md`** — 2 items (one RU, unsigned; one RO signed "Zlobin Alexandru", from the **DoctorChat** platform — check whether attribution/source must be credited). Enough to swap the fakes on the homepage slider (which shows 3) only once a third arrives, or after reducing the slider to 2. Ask the client for more.
- [ ] Note for the CRUD: video appearances are always **embeds** (provider + id + local thumbnail), never uploaded files — see "📥 Incoming client materials" above, plus the WHO-certificate usage restriction before any certificate goes on /media.
- [ ] `media-appearances` module + CRUD — the **/media page is already live** (Phase 5, local data in `lib/media-appearances.ts`); the backend owes the model (kind, outlet, show, date, title/summary ×3 locales, url, embed provider+id, thumbnail) + thumbnail upload, so the client can add items herself. Decide then: move or duplicate the /about "Certificări recente" block onto /media.
- [ ] `materials` module (already owed by Phase 2) — PDF guides editable from the back office.
- [ ] **Site media** module: hero video + poster + portraits editable (client expects this, answer v2 §3). Keep the "new filename on swap" cache rule.
- [ ] **RU fields across content models** (`*_ru` on services/blog/about/FAQ/testimonials/materials) + Prisma migration + back-office tri-lingual editors + frontend consumption. Without it the RU site stays a RO fallback forever.

### Phase 11 — Payments (§11.8) ⛔ blocked on scope sign-off (blocker #10)
- [ ] Agree scope/budget/timeline and the method priority with the client **before any code**.
- [ ] Verify merchant availability for a Moldovan entity: acquirer for card + MIA (maib / Victoriabank / Paynet), PayPal, Revolut. Record what is actually obtainable.
- [ ] `payments` module: provider adapter(s), checkout session, webhook + signature verification, idempotency, `paymentStatus` transitions, refunds, receipts.
- [ ] Rework the booking flow: service → slot → **payment** → confirmation. Decide custom checkout before Calendly vs Calendly-native collection (PayPal-only in practice).
- [ ] Reuse the same checkout for **group C deliverables**, **subscriptions**, and **paid library materials**.
- [ ] SEPA: display IBAN + manual confirmation in the back office (no auto-confirm without a bank API) — set this expectation with the client.

### Phase 12 — Patient document upload (§11.14) ⛔ blocked on blockers #11 + #12
- [ ] Choose (A) tokenised per-appointment upload link vs (B) patient accounts. Recommend (A).
- [ ] One reusable upload primitive (`storage` module): type/size limits, malware scan, EU-region storage, expiring links, PII-safe logging, deletion path.
- [ ] Surface it in: appointment confirmation email, group C order flow, subscription onboarding.
- [ ] Consent text + retention policy in /gdpr and in the upload UI (special-category data).

### Phase 13 — Small items from answers v2
- [ ] **EXPRESS copy**: add the "în timpul programului de lucru" qualifier everywhere the ~1h promise appears (RO/EN/RU); publish the schedule once received.
- [ ] **Business-hours `dueAt`** for EXPRESS in the API + back-office deadline indicator.
- [ ] **Video subtitles**: RO transcript → EN/RU `.vtt`; decide hero-with-controls vs full video on /about (§11.7). Bundle the `prefers-reduced-motion` hero pause with it.
- [ ] **Cookie banner**: finalise the CMP on the "Accept all / Reject / Customize" requirement (answer v2 §9) — closes the Phase 3 deferred decision.
- [ ] **Calendly swap** the moment the paid account arrives: URLs + real `event_type` API URIs + Google Meet location config (Phase 7).
