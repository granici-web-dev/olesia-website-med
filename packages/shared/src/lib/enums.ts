/**
 * Shared enums — the single source of truth for roles, service codes and
 * statuses used across the API, the back office and the public site.
 * Mirror these in the Prisma schema (apps/api) so the DB and app code agree.
 */

/** Back-office user roles. */
export enum Role {
  Admin = 'admin',
  Editor = 'editor',
}

/** Supported content locales. `ro` is the default. */
export enum Locale {
  Ro = 'ro',
  En = 'en',
}

/** Stable code identifying each of the 5 services. */
export enum ServiceCode {
  Pediatric = 'pediatric',
  Nutrition = 'nutrition',
  Integrative = 'integrative',
  Monitoring = 'monitoring',
  QuickQuestion = 'quick_question',
}

/** Whether a service needs a calendar slot (A) or is portal-only (B). */
export enum ServiceGroup {
  /** Group A — booked as a Calendly video slot (services 01–03). */
  Booking = 'A_booking',
  /** Group B — handled in the portal/back office, no calendar (04, 05). */
  Portal = 'B_portal',
}

/** Lifecycle of a video-consultation appointment. */
export enum AppointmentStatus {
  Scheduled = 'scheduled',
  Canceled = 'canceled',
  Completed = 'completed',
  NoShow = 'no_show',
}

/** Manual payment state (no gateway this iteration). */
export enum PaymentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
}

/** Blog post visibility. */
export enum PostStatus {
  Draft = 'draft',
  Published = 'published',
}

/** Kind of a contact entry. */
export enum ContactType {
  Phone = 'phone',
  Email = 'email',
  Address = 'address',
  Social = 'social',
  Other = 'other',
}

/** Lifecycle of a "Monitorizare 3 luni" subscription (service 04). */
export enum SubscriptionStatus {
  Active = 'active',
  Paused = 'paused',
  Expired = 'expired',
  Canceled = 'canceled',
}

/** Lifecycle of a "Întrebare rapidă" ticket (service 05). */
export enum QuickQuestionStatus {
  Open = 'open',
  Answered = 'answered',
  Closed = 'closed',
}
