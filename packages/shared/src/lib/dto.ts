import {
  AppointmentStatus,
  ContactMessageStatus,
  ContactType,
  DeliverableOrderStatus,
  DeliverableProduct,
  MaterialAccess,
  MaterialFlag,
  MediaEmbedProvider,
  MediaKind,
  PatientEntryType,
  PaymentState,
  PaymentStatus,
  PaymentTargetType,
  RefundState,
  PostStatus,
  QuickQuestionStatus,
  Role,
  ServiceCode,
  ServiceGroup,
  SubscriptionStatus,
  UploadLinkTarget,
} from './enums.js';

/**
 * API response shapes — the single source of truth the frontends type their
 * API responses against. Datetimes are ISO-8601 strings (JSON has no Date).
 * Request DTOs with validation live in apps/api but should satisfy these.
 */

/** Generic paginated list envelope used by all list endpoints. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// --- Auth & users ---

export interface LoginRequest {
  email: string;
  password: string;
  /** TOTP or recovery code — sent on the retry after a `totp_required` 401. */
  totpCode?: string;
}

/** Access token is returned in the body; the refresh token is an httpOnly cookie. */
export interface AuthTokens {
  accessToken: string;
  /**
   * The password was set by somebody else (a new account, or an admin reset),
   * so the session is only good for changing it.
   */
  mustChangePassword: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  /** Whether the account has two-factor authentication switched on. */
  totpEnabled: boolean;
  /** Still carrying a password an admin handed over. */
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Returned by POST /auth/2fa/setup — the QR to scan, before 2FA is active. */
export interface TotpEnrolment {
  secret: string;
  otpauthUrl: string;
  qrDataUrl: string;
}

// --- Services / pricing ---

export interface ServiceDto {
  id: string;
  code: ServiceCode;
  group: ServiceGroup;
  titleRo: string;
  titleEn: string;
  titleRu: string | null;
  descriptionRo: string;
  descriptionEn: string;
  descriptionRu: string | null;
  durationMin: number | null;
  price: number;
  priceLabelRo: string | null;
  priceLabelEn: string | null;
  priceLabelRu: string | null;
  /** Group A only — the Calendly event-type URI this service maps to. */
  calendlyEventTypeUri: string | null;
  /** Group A only — the public Calendly booking link for the site embed. */
  calendlySchedulingUrl: string | null;
  sortOrder: number;
  active: boolean;
}

// --- Appointments (group A, Calendly) ---

export interface AppointmentDto {
  id: string;
  serviceId: string;
  /** Calendly `scheduled_event.uri` — also the webhook idempotency key. */
  calendlyEventUri: string;
  clientName: string;
  clientEmail: string;
  reason: string | null;
  startTime: string;
  endTime: string;
  videoUrl: string | null;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  cancelUrl: string | null;
  rescheduleUrl: string | null;
  prepSentAt: string | null;
  /** Written treatment plan typed by the specialist (Markdown/plain text). */
  planText: string | null;
  /**
   * Original filename of an optional plan attachment (prescription/doc), or
   * null when none. The file itself is private — fetched via the authenticated
   * `GET /appointments/:id/plan/file`, never a public URL.
   */
  planFileName: string | null;
  planUploadedAt: string | null;
  /**
   * The canceled appointment this one was rescheduled from, when Calendly said
   * so. A reschedule is a new event with a new URI, so it is a new row; this
   * is the only thing tying the two halves together.
   */
  rescheduledFromId: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Subscriptions (service 04) ---

export interface SubscriptionDto {
  id: string;
  serviceId: string;
  clientName: string;
  clientEmail: string;
  phone: string | null;
  notes: string | null;
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  videoQuotaPerMonth: number;
  videoQuotaUsed: number;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
}

// --- Quick questions (service 05) ---

export interface QuickQuestionDto {
  id: string;
  clientName: string;
  clientEmail: string;
  phone: string | null;
  question: string;
  attachments: string[];
  answer: string | null;
  status: QuickQuestionStatus;
  paymentStatus: PaymentStatus;
  /** 48h SLA deadline. */
  dueAt: string;
  answeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Blog ---

export interface CategoryDto {
  id: string;
  slug: string;
  nameRo: string;
  nameEn: string;
  nameRu: string | null;
}

export interface PostDto {
  id: string;
  slug: string;
  titleRo: string;
  titleEn: string;
  titleRu: string | null;
  excerptRo: string | null;
  excerptEn: string | null;
  excerptRu: string | null;
  contentRo: string;
  contentEn: string;
  contentRu: string | null;
  coverImageUrl: string | null;
  /** Child-age taxonomy keys; empty means "not age-specific". */
  ageKeys: string[];
  status: PostStatus;
  publishedAt: string | null;
  authorId: string;
  categories: CategoryDto[];
  createdAt: string;
  updatedAt: string;
}

// --- Contacts ---

export interface ContactDto {
  id: string;
  type: ContactType;
  labelRo: string;
  labelEn: string;
  labelRu: string | null;
  value: string;
  sortOrder: number;
  active: boolean;
}

/** Non-medical subjects a Contact-form message can be filed under. */
export type ContactMessageSubject =
  | 'appointment'
  | 'payment'
  | 'how_it_works'
  | 'other';

/** A message submitted from the public Contact form (back-office "Mesaje"). */
export interface ContactMessageDto {
  id: string;
  name: string;
  email: string;
  subject: ContactMessageSubject;
  message: string;
  status: ContactMessageStatus;
  /** When the message was opened in the back office. */
  readAt: string | null;
  /** Email reply text (set once answered from the portal). */
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Deliverable orders (group C) ---

/**
 * An order for a personalized menu or a written protocol. `titleRo` and
 * `priceEur` are the catalog values stamped when the order was placed, not
 * today's — a price change must not rewrite what someone already ordered.
 */
export interface DeliverableOrderDto {
  id: string;
  product: DeliverableProduct;
  titleRo: string;
  priceEur: number;
  clientName: string;
  clientEmail: string;
  phone: string | null;
  notes: string | null;
  status: DeliverableOrderStatus;
  paymentStatus: PaymentStatus;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Working hours (client answers v2 §11.5) ---

/** One weekday of the practice schedule. `weekday` is 1 = Monday … 7 = Sunday. */
export interface WorkingDayDto {
  weekday: number;
  closed: boolean;
  /** "HH:MM" wall-clock in the schedule's own timezone. */
  opensAt: string;
  closesAt: string;
}

export interface WorkingHoursDto {
  /** IANA zone the times are written in. */
  timezone: string;
  /** Always seven entries, Monday first. */
  days: WorkingDayDto[];
  /** The EXPRESS promise, in *working* minutes. */
  expressSlaMinutes: number;
  /** True while the schedule is still our placeholder, not the client's. */
  isPlaceholder: boolean;
  updatedAt: string;
}

// --- Patient uploads (client answers v2 §11.14) ---

/** One file a patient sent through their upload link. */
export interface UploadedDocumentDto {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  note: string | null;
  uploadedAt: string;
}

/**
 * What the public upload page is allowed to know. Deliberately thin: the first
 * name it greets the visitor with, when the link stops working, and the files
 * they themselves sent. No appointment details, no medical data, nothing about
 * anyone else — the link is a capability, not a login.
 */
export interface UploadSessionDto {
  target: UploadLinkTarget;
  /** First name only, so a shoulder-surfer learns nothing. */
  greetingName: string;
  expiresAt: string;
  /** Null until the visitor accepts the consent text. */
  consentAt: string | null;
  /**
   * Which wording was accepted (`CONSENT_VERSION`). The page compares it with
   * the version it is showing: a reworded consent has to be agreed to again.
   */
  consentVersion: string | null;
  documents: UploadedDocumentDto[];
  /** Server-enforced limits, so the page can say them before a failed upload. */
  maxFileBytes: number;
  maxFiles: number;
  acceptedTypes: string[];
}

/** Back-office view of a link: everything above, plus how to send it. */
export interface UploadLinkDto {
  id: string;
  target: UploadLinkTarget;
  appointmentId: string | null;
  orderId: string | null;
  clientName: string;
  clientEmail: string;
  /** The full URL to give the patient. */
  url: string;
  expiresAt: string;
  consentAt: string | null;
  revokedAt: string | null;
  documents: UploadedDocumentDto[];
  createdAt: string;
}

// --- About (singleton) ---
//
// These blocks live in `Json` columns, so their RU keys are optional rather
// than nullable: rows written before RU existed simply do not carry them.

/** A headline figure (e.g. "12+" → "ani de practică"). */
export interface AboutStat {
  value: string;
  labelRo: string;
  labelEn: string;
  labelRu?: string;
}

/** A single qualification / credential line. */
export interface AboutCredential {
  ro: string;
  en: string;
  ru?: string;
}

export interface AboutPageDto {
  id: string;
  titleRo: string;
  titleEn: string;
  titleRu: string | null;
  contentRo: string;
  contentEn: string;
  contentRu: string | null;
  images: string[] | null;
  stats: AboutStat[];
  credentials: AboutCredential[];
  updatedAt: string;
}

// --- Testimonials (parent reviews, homepage) ---

/**
 * A parent review. `author` is null for an unsigned one — the site shows a
 * localized neutral label rather than inventing a name.
 */
export interface TestimonialDto {
  id: string;
  quoteRo: string;
  quoteEn: string;
  quoteRu: string | null;
  author: string | null;
  roleRo: string | null;
  roleEn: string | null;
  roleRu: string | null;
  /** Platform the review came from, e.g. "DoctorChat". */
  source: string | null;
  sortOrder: number;
  active: boolean;
}

// --- Biblioteca digitală (downloadable materials, /guides) ---

export interface MaterialCategoryDto {
  id: string;
  slug: string;
  nameRo: string;
  nameEn: string;
  nameRu: string | null;
  sortOrder: number;
}

/**
 * A downloadable material. `fileUrl` is null while the PDF is still missing —
 * the storefront shows the card as "coming soon" rather than a dead link.
 */
export interface MaterialDto {
  id: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  /** Keys from the shared child-age taxonomy; empty means "all ages". */
  ageKeys: string[];
  titleRo: string;
  titleEn: string;
  titleRu: string | null;
  descriptionRo: string;
  descriptionEn: string;
  descriptionRu: string | null;
  pageCount: number | null;
  /** Language the file itself is written in, e.g. "RO". */
  fileLang: string | null;
  access: MaterialAccess;
  /** Whole EUR, paid materials only. */
  price: number | null;
  flags: MaterialFlag[];
  fileUrl: string | null;
  fileName: string | null;
  sortOrder: number;
  active: boolean;
}

// --- Media appearances (the /media page) ---

/**
 * A TV/radio/conference appearance. The recording is always embedded from its
 * original publication — `embedRef` is a YouTube video id or a Facebook video
 * permalink, depending on `embedProvider`. The thumbnail is ours and local, so
 * the page paints without touching a third party before consent.
 */
export interface MediaAppearanceDto {
  id: string;
  kind: MediaKind;
  outlet: string;
  show: string | null;
  /** ISO date, or null when the source never published one. */
  date: string | null;
  duration: string | null;
  titleRo: string;
  titleEn: string;
  titleRu: string | null;
  summaryRo: string;
  summaryEn: string;
  summaryRu: string | null;
  url: string;
  embedProvider: MediaEmbedProvider;
  embedRef: string;
  thumbUrl: string;
  thumbWidth: number;
  thumbHeight: number;
  sortOrder: number;
  active: boolean;
}

// --- FAQ (the public /faq page) ---

/** One question/answer pair inside a category. */
export interface FaqItemDto {
  id: string;
  categoryId: string;
  questionRo: string;
  questionEn: string;
  questionRu: string | null;
  answerRo: string;
  answerEn: string;
  answerRu: string | null;
  sortOrder: number;
  active: boolean;
}

/**
 * A section of the FAQ page, with its questions nested. `slug` is the anchor
 * (`/faq#programare`) the sticky category nav and any deep links point at.
 */
export interface FaqCategoryDto {
  id: string;
  slug: string;
  titleRo: string;
  titleEn: string;
  titleRu: string | null;
  sortOrder: number;
  active: boolean;
  items: FaqItemDto[];
}

// --- Dashboard (module_calendly.md §11) ---

/** Appointment count for one service over the period. */
export interface DashboardServiceCount {
  serviceId: string;
  code: ServiceCode;
  titleRo: string;
  count: number;
}

/** A single upcoming appointment shown on the dashboard. */
export interface DashboardUpcomingItem {
  id: string;
  clientName: string;
  serviceCode: ServiceCode;
  startTime: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
}

/**
 * Aggregated back-office statistics. New metrics can be added without
 * reworking the layout (see the dashboard page). Shares the period bounds so
 * the UI can label and compare.
 */
export interface DashboardStatsDto {
  /** Echoed period bounds (ISO 8601). */
  from: string;
  to: string;
  appointments: {
    /** Total with startTime in [from, to]. */
    total: number;
    /** Same metric for the immediately preceding equal-length window. */
    previousTotal: number;
    byService: DashboardServiceCount[];
    scheduled: number;
    completed: number;
    noShow: number;
    canceled: number;
    /** completed / total, 0..1 (0 when there are none). */
    completionRate: number;
  };
  /** Appointments awaiting manual payment confirmation (point-in-time). */
  pendingPayments: number;
  subscriptions: {
    active: number;
    quotaUsed: number;
    quotaTotal: number;
  };
  quickQuestions: {
    /** Currently open tickets (point-in-time). */
    open: number;
    /** Tickets created within the period. */
    total: number;
    /** Share of period tickets answered within the 48h SLA, 0..1. */
    slaRate: number;
  };
  /** Next scheduled consultations, soonest first. */
  upcoming: DashboardUpcomingItem[];
}

// --- Patients / medical records (module_patients.md) ---

/** One medical-record timeline entry. */
export interface PatientEntryDto {
  id: string;
  patientId: string;
  type: PatientEntryType;
  title: string | null;
  body: string | null;
  fileUrl: string | null;
  fileName: string | null;
  occurredAt: string;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A patient profile. `entryCount`/`lastInteractionAt` populated in lists. */
export interface PatientDto {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  gender: string | null;
  notes: string | null;
  consentAt: string | null;
  createdAt: string;
  updatedAt: string;
  entryCount?: number;
  lastInteractionAt?: string | null;
}

/** A linked lead interaction shown on the patient timeline. */
export interface PatientInteractionDto {
  source: 'appointment' | 'subscription' | 'quick_question';
  sourceId: string;
  label: string;
  occurredAt: string;
  status: string;
  paymentStatus: PaymentStatus;
}

// --- Payments (maib e-Commerce Checkout) ---

/** One refund against a payment. */
export interface PaymentRefundDto {
  id: string;
  /** Null while the refund is reserved in our ledger but not yet acknowledged. */
  refundId: string | null;
  state: RefundState;
  amount: number;
  currency: string;
  kind: string | null;
  reason: string;
  executedAt: string | null;
  createdAt: string;
}

/**
 * One payment as the back office sees it. Deliberately omits `rawCallback`:
 * it is the audit copy of the bank's payload, kept server-side for disputes,
 * and it has no business travelling to a browser.
 */
export interface PaymentDto {
  id: string;
  checkoutId: string;
  paymentId: string | null;
  orderId: string;
  state: PaymentState;
  amount: number;
  currency: string;
  refundedAmount: number;
  method: string | null;
  targetType: PaymentTargetType;
  targetId: string | null;
  payerName: string | null;
  payerEmail: string;
  payerPhone: string | null;
  patientId: string | null;
  rrn: string | null;
  approvalCode: string | null;
  cardMask: string | null;
  threeDsResult: string | null;
  terminalId: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  failedAt: string | null;
  createdAt: string;
  refunds: PaymentRefundDto[];
}
