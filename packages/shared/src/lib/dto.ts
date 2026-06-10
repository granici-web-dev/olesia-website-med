import {
  AppointmentStatus,
  ContactType,
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

export interface AboutPageDto {
  id: string;
  titleRo: string;
  titleEn: string;
  contentRo: string;
  contentEn: string;
  images: string[] | null;
  updatedAt: string;
}
