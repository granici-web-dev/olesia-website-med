import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomBytes } from 'node:crypto';
import { stat } from 'node:fs/promises';
import {
  CONSENT_VERSION,
  type UploadLinkDto,
  type UploadSessionDto,
} from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  StorageService,
  type UploadedImage,
} from '../storage/storage.service';
import { UploadLinkTarget } from '../../generated/prisma/enums';
import {
  UPLOAD_LINK_TTL_DAYS,
  UPLOAD_MAX_FILES,
  UPLOAD_RETENTION_DAYS,
} from './uploads.constants';
import {
  isLinkUsable,
  isPurgeableLink,
  retentionCutoff,
  safeFileName,
} from './upload-rules';
import { toUploadLinkDto, toUploadSessionDto } from './uploads.mapper';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * How long a file on disk is left alone by the orphan sweep. Long enough that
 * a file written while the sweep is running, whose row is still being
 * inserted, is never mistaken for a leftover.
 */
const ORPHAN_GRACE_MS = 24 * 60 * 60 * 1000;

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
      orderBy: { createdAt: 'desc' },
    });

    const expiresAt = new Date(Date.now() + UPLOAD_LINK_TTL_DAYS * DAY_MS);

    const link = existing
      ? await this.prisma.uploadLink.update({
          where: { id: existing.id },
          data: { expiresAt, ...reissue(existing.revokedAt) },
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
      orderBy: { createdAt: 'desc' },
    });

    const expiresAt = new Date(Date.now() + UPLOAD_LINK_TTL_DAYS * DAY_MS);

    const link = existing
      ? await this.prisma.uploadLink.update({
          where: { id: existing.id },
          data: { expiresAt, ...reissue(existing.revokedAt) },
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
    const existing = await this.prisma.uploadLink.findUnique({
      where: { id: linkId },
    });
    if (!existing) throw new NotFoundException('upload_link_not_found');

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

    // A row whose file is gone is a real state (an erasure that failed half
    // way, a database restored without its volume). Say so, rather than let
    // `res.download` fail into a 500.
    const path = this.storage.privateDocPath(doc.fileKey);
    try {
      await stat(path);
    } catch {
      throw new NotFoundException('document_missing');
    }
    return { path, fileName: doc.fileName };
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

  /**
   * Record consent. Idempotent — re-ticking does not move the timestamp, but
   * consent given to an older wording does not count for the current one.
   */
  async acceptConsent(token: string): Promise<UploadSessionDto> {
    const link = await this.liveLinkOrThrow(token);
    if (link.consentAt && link.consentVersion === CONSENT_VERSION) {
      return toUploadSessionDto(link);
    }

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
    if (!file) throw new BadRequestException('No file uploaded.');

    // Consent first — a file that arrives before it is agreed to is a file we
    // had no basis to store, so it is refused rather than saved and cleaned up.
    // Consent to an older wording is asked again, which is what makes the
    // version recorded on the link mean anything.
    if (!link.consentAt || link.consentVersion !== CONSENT_VERSION) {
      throw new ForbiddenException('consent_required');
    }
    if (link.documents.length >= UPLOAD_MAX_FILES) {
      throw new BadRequestException('too_many_files');
    }

    const { key } = await this.storage.savePatientUpload(file);

    await this.prisma.uploadedDocument.create({
      data: {
        linkId: link.id,
        fileKey: key,
        fileName: safeFileName(file.originalname),
        mimeType: file.mimetype,
        sizeBytes: file.size,
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
    const now = new Date();
    await this.purgeDocuments(now);
    await this.purgeDeadLinks(now);
    await this.sweepOrphanFiles();
  }

  /** Files (row and bytes) past the retention period. */
  private async purgeDocuments(now: Date): Promise<void> {
    const stale = await this.prisma.uploadedDocument.findMany({
      where: { uploadedAt: { lt: retentionCutoff(now) } },
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

  /**
   * Links that are long dead and hold nothing. The row is not bookkeeping: it
   * carries the patient's name, email and a token, so once the link has been
   * expired for a retention period and its documents are gone, so is it.
   */
  private async purgeDeadLinks(now: Date): Promise<void> {
    const candidates = await this.prisma.uploadLink.findMany({
      where: { expiresAt: { lt: retentionCutoff(now) } },
      select: { id: true, expiresAt: true, _count: { select: { documents: true } } },
    });
    const purgeable = candidates.filter((link) =>
      isPurgeableLink(
        { expiresAt: link.expiresAt, documentCount: link._count.documents },
        now,
      ),
    );
    if (purgeable.length === 0) return;

    await this.prisma.uploadLink.deleteMany({
      where: { id: { in: purgeable.map((l) => l.id) } },
    });
    this.logger.log(`Purged ${purgeable.length} dead upload link(s).`);
  }

  /**
   * Files on disk that no row points at any more.
   *
   * They are produced by every delete that goes through the database alone: an
   * order deleted with its link cascading, a crash between writing the file and
   * inserting its row. Nothing can find them afterwards, which for
   * special-category data means nothing can delete them either.
   *
   * The referenced set covers all three tables that store into the private
   * directory, because the sweep works on the directory, not on a table.
   */
  private async sweepOrphanFiles(): Promise<void> {
    const [documents, entries, plans] = await Promise.all([
      this.prisma.uploadedDocument.findMany({ select: { fileKey: true } }),
      this.prisma.patientEntry.findMany({
        where: { fileUrl: { not: null } },
        select: { fileUrl: true },
      }),
      this.prisma.appointment.findMany({
        where: { planFileKey: { not: null } },
        select: { planFileKey: true },
      }),
    ]);

    const referenced = new Set<string>([
      ...documents.map((d) => d.fileKey),
      ...entries.map((e) => e.fileUrl!),
      ...plans.map((a) => a.planFileKey!),
    ]);

    const removed = await this.storage.deleteUnreferencedPrivateFiles(
      referenced,
      ORPHAN_GRACE_MS,
    );
    if (removed.length > 0) {
      this.logger.warn(
        `Removed ${removed.length} orphaned private file(s) — no row referenced them.`,
      );
    }
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
    if (!isLinkUsable(link, new Date())) {
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
 * What re-issuing changes besides the expiry. A link is normally revoked
 * because it went somewhere it should not have, so reviving it under the same
 * URL would hand that copy another thirty days: a revoked link comes back with
 * a new token. The row and its documents stay, so nothing the patient already
 * sent appears to vanish.
 */
function reissue(revokedAt: Date | null): { revokedAt: null; token?: string } {
  return revokedAt
    ? { revokedAt: null, token: newToken() }
    : { revokedAt: null };
}

