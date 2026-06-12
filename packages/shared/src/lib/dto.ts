import {
  AppointmentStatus,
  ContactType,
  PatientEntryType,
  PaymentStatus,
  PostStatus,
  QuickQuestionStatus,
  Role,
  ServiceCode,
  ServiceGroup,
  SubscriptionStatus,
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
}

/** Access token is returned in the body; the refresh token is an httpOnly cookie. */
export interface AuthTokens {
  accessToken: string;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Services / pricing ---

export interface ServiceDto {
  id: string;
  code: ServiceCode;
  group: ServiceGroup;
  titleRo: string;
  titleEn: string;
  descriptionRo: string;
  descriptionEn: string;
  durationMin: number | null;
  price: number;
  priceLabelRo: string | null;
  priceLabelEn: string | null;
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
  /** Public URL of the written plan uploaded by the specialist. */
  planUrl: string | null;
  planUploadedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Subscriptions (service 04) ---

export interface SubscriptionDto {
  id: string;
  serviceId: string;
  clientName: string;
  clientEmail: string;
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
}

export interface PostDto {
  id: string;
  slug: string;
  titleRo: string;
  titleEn: string;
  excerptRo: string | null;
  excerptEn: string | null;
  contentRo: string;
  contentEn: string;
  coverImageUrl: string | null;
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
  value: string;
  sortOrder: number;
  active: boolean;
}

// --- About (singleton) ---

/** A headline figure (e.g. "12+" → "ani de practică"). */
export interface AboutStat {
  value: string;
  labelRo: string;
  labelEn: string;
}

/** A single qualification / credential line. */
export interface AboutCredential {
  ro: string;
  en: string;
}

/** A parent testimonial. */
export interface AboutTestimonial {
  quoteRo: string;
  quoteEn: string;
  author: string;
  roleRo: string;
  roleEn: string;
}

/** One FAQ entry. */
export interface AboutFaqItem {
  qRo: string;
  qEn: string;
  aRo: string;
  aEn: string;
}

export interface AboutPageDto {
  id: string;
  titleRo: string;
  titleEn: string;
  contentRo: string;
  contentEn: string;
  images: string[] | null;
  stats: AboutStat[];
  credentials: AboutCredential[];
  testimonials: AboutTestimonial[];
  faq: AboutFaqItem[];
  updatedAt: string;
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
