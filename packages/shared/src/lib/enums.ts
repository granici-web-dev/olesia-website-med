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

/** Stable code identifying each service. */
export enum ServiceCode {
  Pediatric = 'pediatric',
  Nutrition = 'nutrition',
  Integrative = 'integrative',
  Monitoring = 'monitoring',
  QuickQuestion = 'quick_question',
  /** Free orientation call (group A, price 0) — booked via Calendly. */
  FreeConsult = 'free_consult',
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

/** Lifecycle of a Contact-form message (public site → back-office "Mesaje"). */
export enum ContactMessageStatus {
  /** Just arrived, not yet opened. */
  New = 'new',
  /** Opened/read in the back office. */
  Read = 'read',
  /** Answered by email from the portal. */
  Replied = 'replied',
}

/**
 * The group-C deliverable products (brief §2) — personalized menus and written
 * protocols. Stable codes; prices and labels live in `DELIVERABLE_CATALOG`.
 */
export enum DeliverableProduct {
  Menu7 = 'menu_7',
  Menu14 = 'menu_14',
  Menu30 = 'menu_30',
  ProtocolPedNutri = 'protocol_pednutri',
  ProtocolComplementary = 'protocol_complementary',
}

/** Lifecycle of a deliverable order, from the form to the delivered file. */
export enum DeliverableOrderStatus {
  /** Just ordered, nobody has looked at it yet. */
  New = 'new',
  /** The doctor is preparing the menu/protocol. */
  InProgress = 'in_progress',
  /** Sent to the client. */
  Delivered = 'delivered',
  Canceled = 'canceled',
}

/** Kind of a patient medical-record timeline entry (module_patients.md). */
export enum PatientEntryType {
  Anamnesis = 'anamnesis',
  Note = 'note',
  Prescription = 'prescription',
  Document = 'document',
}

/** What kind of appearance a /media entry is. */
export enum MediaKind {
  Tv = 'tv',
  Radio = 'radio',
  Conference = 'conference',
  Press = 'press',
}

/** Where a media recording is embedded from. Never self-hosted. */
export enum MediaEmbedProvider {
  Youtube = 'youtube',
  Facebook = 'facebook',
}

/** Whether a library material is a free download or a paid one. */
export enum MaterialAccess {
  Free = 'free',
  Paid = 'paid',
}

/** Merchandising badge on a material card. */
export enum MaterialFlag {
  Recommended = 'recommended',
  Popular = 'popular',
  New = 'new',
}
