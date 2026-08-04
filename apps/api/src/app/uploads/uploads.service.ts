import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomBytes } from 'node:crypto';
import type { UploadLinkDto, UploadSessionDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  StorageService,
  type UploadedImage,
} from '../storage/storage.service';
import { UploadLinkTarget } from '../../generated/prisma/enums';
import {
  CONSENT_VERSION,
  UPLOAD_LINK_TTL_DAYS,
  UPLOAD_MAX_FILES,
  UPLOAD_RETENTION_DAYS,
} from './uploads.constants';
import { toUploadLinkDto, toUploadSessionDto } from './uploads.mapper';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Where the public upload page lives. The link is useless without the site, so
 * this has to be the site's origin — not the API's.
 */
const SITE_URL = (
  process.env.PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

/** PII-safe recipient for logs (first char + domain), as elsewhere. */
function maskEmail(email: string): string {
  const at = email.indexOf('@');
  return at <= 0 ? '***' : `${email[0]}***${email.slice(at)}`;
}

/**
 * Patient document uploads (client answers v2 §11.14).
 *
 * There are no patient accounts, so access is a **capability**: a single
 * opaque token in a URL, scoped to one appointment or one order, that expires.
 * It grants exactly three things — see your own files, add one, remove one.
 * It cannot read an appointment, a medical record, or anyone else's anything.
 *
 * Two rules run through the whole module:
 *
 * 1. **Nothing is stored before consent.** Opening a link is not agreement to
 *    send medical data, so the first upload is rejected until the consent box
 *    has been accepted, and the version of the wording is recorded with it.
 * 2. **A wrong or dead token is always the same 404.** Never "expired",
 *    never "revoked", never "wrong appointment" — a differentiated error turns
 *    the endpoint into an oracle for guessing tokens.
 */
@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly mail: MailService,
  ) {}

  /* --------------------------- back office --------------------------- */

  /**
   * Issue (or re-issue) the upload link for an appointment.
   *
   * Re-issuing extends the existing link rather than minting a second one:
   * two live links for one appointment means the doctor can send the wrong one
   * and the patient's earlier uploads appear to have vanished.
   */
  async linkForAppointment(appointmentId: string): Promise<UploadLinkDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!appointment) throw new NotFoundException('appointment_not_found');

    const existing = await this.prisma.uploadLink.findFirst({
      where: { appointmentId },
      include: { documents: { orderBy: { uploadedAt: 'desc' } } },
    });

    const expiresAt = new Date(Date.now() + UPLOAD_LINK_TTL_DAYS * DAY_MS);

    const link = existing
      ? await this.prisma.uploadLink.update({
          where: { id: existing.id },
          data: { expiresAt, revokedAt: null },
          include: { documents: { orderBy: { uploadedAt: 'desc' } } },
        })
      : await this.prisma.uploadLink.create({
          data: {
            token: newToken(),
            target: UploadLinkTarget.appointment,
            appointmentId,
            clientName: appointment.clientName,
            clientEmail: appointment.clientEmail,
            expiresAt,
          },
          include: { documents: true },
        });

    return toUploadLinkDto(link, this.publicUrl(link.token));
  }

  /** Same, for a group-C order (protocols are built from sent documents). */
  async linkForOrder(orderId: string): Promise<UploadLinkDto> {
    const order = await this.prisma.deliverableOrder.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('deliverable_order_not_found');

    const existing = await this.prisma.uploadLink.findFirst({
      where: { orderId },
      include: { documents: { orderBy: { uploadedAt: 'desc' } } },
    });

    const expiresAt = new Date(Date.now() + UPLOAD_LINK_TTL_DAYS * DAY_MS);

    const link = existing
      ? await this.prisma.uploadLink.update({
          where: { id: existing.id },
          data: { expiresAt, revokedAt: null },
          include: { documents: { orderBy: { uploadedAt: 'desc' } } },
        })
      : await this.prisma.uploadLink.create({
          data: {
            token: newToken(),
            target: UploadLinkTarget.deliverable_order,
            orderId,
            clientName: order.clientName,
            clientEmail: order.clientEmail,
            expiresAt,
          },
          include: { documents: true },
        });

    return toUploadLinkDto(link, this.publicUrl(link.token));
  }

  /**
   * Email the link to the patient. Reports whether it actually left, because
   * with no SMTP configured it does not — and the doctor needs to know that so
   * she sends it herself instead of assuming.
   */
  async sendLink(linkId: string): Promise<{ sent: boolean }> {
    const link = await this.prisma.uploadLink.findUnique({
      where: { id: linkId },
    });
    if (!link) throw new NotFoundException('upload_link_not_found');

    const sent = await this.mail.sendToClient({
      to: link.clientEmail,
      subject: 'Încărcarea analizelor înainte de consultație',
      lines: [
        `Bună ziua, ${link.clientName},`,
        '',
        'Pentru ca discuția noastră să fie cât mai utilă, puteți trimite în avans analizele, investigațiile și documentele medicale relevante:',
        this.publicUrl(link.token),
        '',
        `Linkul este personal și expiră la ${link.expiresAt.toLocaleDateString('ro-RO')}.`,
        '',
        'Cu drag,',
        'Dr. Olesea Jalba',
      ],
    });

    this.logger.log(
      `Upload link ${sent ? 'emailed' : 'NOT emailed (no SMTP)'} → ${maskEmail(link.clientEmail)}`,
    );
    return { sent };
  }

  /** Links (with their documents) attached to an appointment. */
  async listForAppointment(appointmentId: string): Promise<UploadLinkDto[]> {
    const links = await this.prisma.uploadLink.findMany({
      where: { appointmentId },
      include: { documents: { orderBy: { uploadedAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return links.map((l) => toUploadLinkDto(l, this.publicUrl(l.token)));
  }

  /** Stop a link working, without touching what was already sent. */
  async revoke(linkId: string): Promise<UploadLinkDto> {
    const link = await this.prisma.uploadLink.update({
      where: { id: linkId },
      data: { revokedAt: new Date() },
      include: { documents: { orderBy: { uploadedAt: 'desc' } } },
    });
    return toUploadLinkDto(link, this.publicUrl(link.token));
  }

  /** Staff download — streamed by the controller, never a public URL. */
  async documentPath(
    documentId: string,
  ): Promise<{ path: string; fileName: string }> {
    const doc = await this.prisma.uploadedDocument.findUnique({
      where: { id: documentId },
    });
    if (!doc) throw new NotFoundException('document_not_found');
    return {
      path: this.storage.privateDocPath(doc.fileKey),
      fileName: doc.fileName,
    };
  }

  /** Staff erasure — the bytes go too, not just the row. */
  async deleteDocument(documentId: string): Promise<void> {
    const doc = await this.prisma.uploadedDocument.findUnique({
      where: { id: documentId },
    });
    if (!doc) throw new NotFoundException('document_not_found');
    await this.storage.deletePrivateDocument(doc.fileKey);
    await this.prisma.uploadedDocument.delete({ where: { id: documentId } });
  }

  /* ------------------------------ public ------------------------------ */

  async session(token: string): Promise<UploadSessionDto> {
    return toUploadSessionDto(await this.liveLinkOrThrow(token));
  }

  /** Record consent. Idempotent — re-ticking does not move the timestamp. */
  async acceptConsent(token: string): Promise<UploadSessionDto> {
    const link = await this.liveLinkOrThrow(token);
    if (link.consentAt) return toUploadSessionDto(link);

    const updated = await this.prisma.uploadLink.update({
      where: { id: link.id },
      data: { consentAt: new Date(), consentVersion: CONSENT_VERSION },
      include: { documents: { orderBy: { uploadedAt: 'desc' } } },
    });
    return toUploadSessionDto(updated);
  }

  async addDocument(
    token: string,
    file: UploadedImage | undefined,
    note?: string,
  ): Promise<UploadSessionDto> {
    const link = await this.liveLinkOrThrow(token);

    // Consent first — a file that arrives before it is agreed to is a file we
    // had no basis to store, so it is refused rather than saved and cleaned up.
    if (!link.consentAt) throw new ForbiddenException('consent_required');
    if (link.documents.length >= UPLOAD_MAX_FILES) {
      throw new BadRequestException('too_many_files');
    }

    const { key } = await this.storage.savePatientUpload(file);
    const f = file as UploadedImage;

    await this.prisma.uploadedDocument.create({
      data: {
        linkId: link.id,
        fileKey: key,
        fileName: safeFileName(f.originalname),
        mimeType: f.mimetype,
        sizeBytes: f.size,
        note: note?.trim() ? note.trim().slice(0, 500) : null,
      },
    });

    // No filename in the log: patients name files things like
    // "analize-ionut-diabet.pdf".
    this.logger.log(`Patient upload stored for link ${link.id}.`);
    return this.session(token);
  }

  /** The patient removing something they sent by mistake. */
  async removeOwnDocument(
    token: string,
    documentId: string,
  ): Promise<UploadSessionDto> {
    const link = await this.liveLinkOrThrow(token);
    const doc = link.documents.find((d) => d.id === documentId);
    // Not theirs → the same 404 as a bad token. No probing other people's ids.
    if (!doc) throw new NotFoundException('upload_not_found');

    await this.storage.deletePrivateDocument(doc.fileKey);
    await this.prisma.uploadedDocument.delete({ where: { id: doc.id } });
    return this.session(token);
  }

  /* ------------------------------ purge ------------------------------- */

  /**
   * Delete medical files past the retention period — row and bytes.
   *
   * Special-category data that nobody deletes is the failure this feature is
   * most likely to produce, so the deletion is automatic rather than a manual
   * step somebody has to remember.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeExpired(): Promise<void> {
    const cutoff = new Date(Date.now() - UPLOAD_RETENTION_DAYS * DAY_MS);
    const stale = await this.prisma.uploadedDocument.findMany({
      where: { uploadedAt: { lt: cutoff } },
    });
    if (stale.length === 0) return;

    for (const doc of stale) {
      await this.storage.deletePrivateDocument(doc.fileKey);
    }
    await this.prisma.uploadedDocument.deleteMany({
      where: { id: { in: stale.map((d) => d.id) } },
    });
    this.logger.log(
      `Purged ${stale.length} patient upload(s) older than ${UPLOAD_RETENTION_DAYS} days.`,
    );
  }

  /* ----------------------------- internals ---------------------------- */

  private publicUrl(token: string): string {
    // Romanian is the default locale and the only one a link is ever sent in;
    // the page itself switches language from the site's own picker.
    return `${SITE_URL}/ro/incarcare/${token}`;
  }

  /**
   * The one place a token is resolved. Unknown, expired and revoked all leave
   * here as the same NotFound — anything more specific is a guessing oracle.
   */
  private async liveLinkOrThrow(token: string) {
    const link = await this.prisma.uploadLink.findUnique({
      where: { token },
      include: { documents: { orderBy: { uploadedAt: 'desc' } } },
    });
    if (!link || link.revokedAt || link.expiresAt.getTime() < Date.now()) {
      throw new NotFoundException('upload_link_not_found');
    }
    return link;
  }
}

/** 32 random bytes, URL-safe. Long enough that guessing is not a strategy. */
function newToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Keep the patient's filename for the doctor's benefit, minus anything that
 * could steer a path or a header. The stored key is a UUID either way, so this
 * only ever affects the download filename.
 */
function safeFileName(name: string | undefined): string {
  const base = (name ?? 'document').replace(/[/\\\r\n ]/g, '_').trim();
  return base.slice(0, 120) || 'document';
}
