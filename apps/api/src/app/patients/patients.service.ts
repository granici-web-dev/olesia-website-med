import { stat } from 'node:fs/promises';

import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type {
  Paginated,
  PatientDto,
  PatientEntryDto,
  PatientErasureReportDto,
  PatientErasureTableResultDto,
  PatientInteractionDto,
} from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { writeOrTranslate } from '../common/prisma-errors';
import { StorageService, type UploadedImage } from '../storage/storage.service';
import { paginate } from '../common/dto/pagination.dto';
import { normalizePatientEmail } from '../common/patient-email';
import { PatientNotificationsService } from '../mail/patient-notifications.service';
import { Locale, PatientEntryType } from '../../generated/prisma/enums';
import { Prisma } from '../../generated/prisma/client';
import {
  ENTRY_INCLUDE,
  toPatientDto,
  toPatientEntryDto,
} from './patients.mapper';
import { lastKnownLocale } from './patient-locale';
import { sendRefusal, type SendRefusal } from './send-refusal';
import {
  entryContentRefusal,
  hasEntryText,
  type EntryContent,
} from './entry-content';
import { CALENDLY_MANUAL_STEP, erasureTargets } from './erasure-targets';
import { toInteractions } from './interactions';
import {
  CreatePatientDto,
  ListPatientsDto,
  UpdatePatientDto,
} from './dto/patient.dto';
import { CreateEntryDto, UpdateEntryDto } from './dto/entry.dto';
import { FromLeadDto } from './dto/from-lead.dto';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly notifications: PatientNotificationsService,
  ) {}

  /**
   * Upload a private file → a `document` or a `prescription` timeline entry.
   * An untitled document takes the file's name; an untitled prescription is
   * "Rețetă" (docs/shape-prescription-file.md, open question 5, answered
   * 2026-09-16).
   */
  async addDocument(
    id: string,
    file: UploadedImage | undefined,
    title: string | undefined,
    type: 'prescription' | 'document',
    authorId: string,
  ): Promise<PatientEntryDto> {
    await this.getOrThrow(id);
    const { key } = await this.storage.savePrivateDocument(file);
    const entry = await this.prisma.patientEntry.create({
      data: {
        patientId: id,
        type,
        title:
          title ??
          (type === PatientEntryType.prescription
            ? 'Rețetă'
            : file!.originalname),
        fileUrl: key,
        fileName: file!.originalname,
        authorId,
      },
      include: ENTRY_INCLUDE,
    });
    this.audit('document.upload', {
      patientId: id,
      entryId: entry.id,
      type,
      userId: authorId,
    });
    return toPatientEntryDto(entry);
  }

  /**
   * Resolve the private file of a document or a prescription for streaming
   * (auth-checked by the route). Only those two types can hold a file.
   */
  async getDocument(
    id: string,
    entryId: string,
    userId: string,
  ): Promise<{ path: string; fileName: string }> {
    const e = await this.getEntryOrThrow(id, entryId);
    if (!e.fileUrl) {
      throw new NotFoundException('document_not_found');
    }
    this.audit('document.download', { patientId: id, entryId, userId });
    return {
      path: this.storage.privateDocPath(e.fileUrl),
      fileName: e.fileName ?? 'document',
    };
  }

  async findAll(query: ListPatientsDto): Promise<Paginated<PatientDto>> {
    const where: Prisma.PatientWhereInput = query.search
      ? {
          OR: [
            { fullName: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: { _count: { select: { entries: true } } },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return paginate(
      items.map((p) => toPatientDto(p, { entryCount: p._count.entries })),
      total,
      query,
    );
  }

  async findOne(id: string): Promise<PatientDto> {
    const p = await this.getOrThrow(id);
    const newest = {
      where: { patientId: id },
      orderBy: { createdAt: 'desc' },
      select: { locale: true, createdAt: true },
    } as const;
    const [entryCount, ...newestPerTable] = await Promise.all([
      this.prisma.patientEntry.count({ where: { patientId: id } }),
      this.prisma.appointment.findFirst(newest),
      this.prisma.subscription.findFirst(newest),
      this.prisma.quickQuestion.findFirst(newest),
      this.prisma.deliverableOrder.findFirst(newest),
    ]);
    return toPatientDto(p, {
      entryCount,
      lastKnownLocale: lastKnownLocale(newestPerTable),
    });
  }

  async create(dto: CreatePatientDto): Promise<PatientDto> {
    const email = this.requireEmail(dto.email);
    // `toData` widens shared fields to optional (it also serves updates); on
    // create, re-assert the required identity fields from the DTO.
    return toPatientDto(
      await writeOrTranslate(() =>
        this.prisma.patient.create({
          data: { ...this.toData(dto), fullName: dto.fullName, email },
        }),
      ),
    );
  }

  async update(id: string, dto: UpdatePatientDto): Promise<PatientDto> {
    await this.getOrThrow(id);
    const email = dto.email ? this.requireEmail(dto.email) : undefined;
    return toPatientDto(
      await writeOrTranslate(() =>
        this.prisma.patient.update({
          where: { id },
          data: { ...this.toData(dto), ...(email ? { email } : {}) },
        }),
      ),
    );
  }

  /**
   * GDPR erasure (right to be forgotten).
   *
   * What it does, precisely — the previous comment here claimed it removed
   * "every trace of the person", and audit A3 (F1) found seven places where
   * it did not:
   * - deletes the dossier, which cascades its `PatientEntry` rows, and the
   *   private files those entries point at, prescriptions' included;
   * - deletes every upload link reaching this person, by its own address or
   *   through the appointment it was issued for, and with them the medical
   *   documents the patient sent — rows and bytes;
   * - anonymizes the PII on every appointment, subscription, EXPRESS ticket,
   *   group-C order and contact message that carries this person's address,
   *   whether or not it was ever linked to the dossier;
   * - anonymizes the payer on `Payment` rows while keeping the money and the
   *   bank's references, which is a deliberate accounting exception.
   *
   * What it cannot do: delete Calendly's own copy of the invitee. That is
   * returned as a manual step rather than left unsaid.
   *
   * The row mutations run in one transaction; disk cleanup is best-effort
   * afterwards, and `deleteUnreferencedPrivateFiles` sweeps whatever a crash
   * in between leaves behind.
   */
  async remove(id: string): Promise<PatientErasureReportDto> {
    const patient = await this.getOrThrow(id);
    const plan = erasureTargets(id, patient.email);

    // Captured BEFORE the transaction: the anonymization nulls the keys and
    // the cascade removes the rows these file references live on.
    const [docs, plans, links] = await Promise.all([
      this.prisma.patientEntry.findMany({
        where: { patientId: id, fileUrl: { not: null } },
        select: { fileUrl: true },
      }),
      this.prisma.appointment.findMany({
        where: { ...plan.appointment.where, planFileKey: { not: null } },
        select: { planFileKey: true },
      }),
      this.prisma.uploadLink.findMany({
        where: plan.uploadLink.where,
        select: { id: true, documents: { select: { fileKey: true } } },
      }),
    ]);

    const tables = await this.prisma.$transaction(async (tx) => {
      const counted: PatientErasureTableResultDto[] = [];
      const record = (
        table: string,
        action: PatientErasureTableResultDto['action'],
        rows: number,
      ) => counted.push({ table, action, rows });

      const removedLinks = await tx.uploadLink.deleteMany({
        where: { id: { in: links.map((l) => l.id) } },
      });
      record('UploadLink', 'delete', removedLinks.count);
      record(
        'UploadedDocument',
        'cascade',
        links.reduce((n, l) => n + l.documents.length, 0),
      );

      const appointment = plan.appointment;
      record(
        'Appointment',
        'anonymize',
        (
          await tx.appointment.updateMany({
            where: appointment.where,
            data: appointment.data,
          })
        ).count,
      );

      const subscription = plan.subscription;
      record(
        'Subscription',
        'anonymize',
        (
          await tx.subscription.updateMany({
            where: subscription.where,
            data: subscription.data,
          })
        ).count,
      );

      const quickQuestion = plan.quickQuestion;
      record(
        'QuickQuestion',
        'anonymize',
        (
          await tx.quickQuestion.updateMany({
            where: quickQuestion.where,
            data: quickQuestion.data,
          })
        ).count,
      );

      const deliverableOrder = plan.deliverableOrder;
      record(
        'DeliverableOrder',
        'anonymize',
        (
          await tx.deliverableOrder.updateMany({
            where: deliverableOrder.where,
            data: deliverableOrder.data,
          })
        ).count,
      );

      const contactMessage = plan.contactMessage;
      record(
        'ContactMessage',
        'anonymize',
        (
          await tx.contactMessage.updateMany({
            where: contactMessage.where,
            data: contactMessage.data,
          })
        ).count,
      );

      const payment = plan.payment;
      record(
        'Payment',
        'anonymize',
        (
          await tx.payment.updateMany({
            where: payment.where,
            data: payment.data,
          })
        ).count,
      );

      record(
        'PatientEntry',
        'cascade',
        await tx.patientEntry.count({ where: { patientId: id } }),
      );
      record(
        'PatientEntrySend',
        'cascade',
        await tx.patientEntrySend.count({
          where: { entry: { patientId: id } },
        }),
      );
      await tx.patient.delete({ where: plan.patient.where });
      record('Patient', 'delete', 1);

      return counted;
    });

    // Best-effort physical cleanup — outside the transaction (disk ops).
    await Promise.all([
      ...docs.map((d) => this.storage.deletePrivateDocument(d.fileUrl!)),
      ...plans.map((p) => this.storage.deletePrivateDocument(p.planFileKey!)),
      ...links
        .flatMap((l) => l.documents)
        .map((d) => this.storage.deletePrivateDocument(d.fileKey)),
    ]);

    this.audit('patient.erase', {
      patientId: id,
      rows: tables.map((t) => `${t.table}:${t.rows}`).join(' '),
    });
    return { tables, manualSteps: [CALENDLY_MANUAL_STEP] };
  }

  /** Merged medical-record timeline: entries + linked lead interactions. */
  async timeline(id: string): Promise<{
    entries: PatientEntryDto[];
    interactions: PatientInteractionDto[];
  }> {
    await this.getOrThrow(id);
    const [entries, appts, subs, qqs, orders] = await Promise.all([
      this.prisma.patientEntry.findMany({
        where: { patientId: id },
        orderBy: { occurredAt: 'desc' },
        include: ENTRY_INCLUDE,
      }),
      this.prisma.appointment.findMany({ where: { patientId: id } }),
      this.prisma.subscription.findMany({ where: { patientId: id } }),
      this.prisma.quickQuestion.findMany({ where: { patientId: id } }),
      this.prisma.deliverableOrder.findMany({ where: { patientId: id } }),
    ]);

    const interactions = toInteractions({
      appointments: appts,
      subscriptions: subs,
      quickQuestions: qqs,
      deliverableOrders: orders,
    });

    return { entries: entries.map(toPatientEntryDto), interactions };
  }

  async addEntry(
    id: string,
    dto: CreateEntryDto,
    authorId: string,
  ): Promise<PatientEntryDto> {
    await this.getOrThrow(id);
    const body = dto.body ?? null;
    assertEntryContent({ type: dto.type, body, fileUrl: null });
    return toPatientEntryDto(
      await this.prisma.patientEntry.create({
        data: {
          patientId: id,
          type: dto.type,
          title: dto.title ?? null,
          body,
          occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
          authorId,
        },
        include: ENTRY_INCLUDE,
      }),
    );
  }

  async updateEntry(
    id: string,
    entryId: string,
    dto: UpdateEntryDto,
    authorId: string,
  ): Promise<PatientEntryDto> {
    const stored = await this.getEntryOrThrow(id, entryId);
    // The rule holds for the row as it will be stored: clearing the text of a
    // file-only prescription is fine, of a text-only one is not.
    assertEntryContent({
      type: dto.type ?? stored.type,
      body: dto.body === undefined ? stored.body : dto.body,
      fileUrl: stored.fileUrl,
    });
    return toPatientEntryDto(
      await this.prisma.patientEntry.update({
        where: { id: entryId },
        data: {
          type: dto.type,
          title: dto.title,
          body: dto.body,
          authorId,
          ...(dto.occurredAt ? { occurredAt: new Date(dto.occurredAt) } : {}),
        },
        include: ENTRY_INCLUDE,
      }),
    );
  }

  async removeEntry(
    id: string,
    entryId: string,
    userId: string,
  ): Promise<void> {
    const e = await this.getEntryOrThrow(id, entryId);
    await this.prisma.patientEntry.delete({ where: { id: entryId } });
    this.audit('entry.delete', { patientId: id, entryId, userId });
    // Right-to-erasure also applies per entry: drop the physical file.
    if (e.fileUrl) {
      await this.storage.deletePrivateDocument(e.fileUrl);
    }
  }

  /**
   * Email a prescription (its text in the body, its file attached, or both)
   * or a document (as an attachment) to the address on the dossier, in the
   * language the doctor chose (docs/shape-send-prescription.md,
   * docs/shape-prescription-file.md). The recipient is never an argument: a
   * typed address is how a medical file reaches the wrong parent.
   */
  async sendEntry(
    id: string,
    entryId: string,
    locale: Locale,
    userId: string,
  ): Promise<PatientEntryDto> {
    const patient = await this.getOrThrow(id);
    const entry = await this.getEntryOrThrow(id, entryId);

    const filePath = entry.fileUrl
      ? this.storage.privateDocPath(entry.fileUrl)
      : null;
    const refusal = sendRefusal(
      entry,
      this.notifications.canSend,
      filePath ? await this.storedFileSize(filePath) : null,
    );
    if (refusal) throw refusalException(refusal);

    const recipient = { to: patient.email, locale };
    const fileName = filePath ? (entry.fileName ?? 'document') : null;
    const attachment = filePath
      ? { filename: fileName!, path: filePath }
      : undefined;
    const { sent } =
      entry.type === PatientEntryType.document
        ? await this.notifications.document(
            recipient,
            { title: entry.title ?? fileName! },
            attachment!,
          )
        : await this.notifications.prescription(
            recipient,
            {
              title: entry.title,
              body: hasEntryText(entry.body) ? entry.body : null,
            },
            attachment,
          );
    if (!sent) throw new BadGatewayException('mail_send_failed');

    // The row is written after the transport has answered, never before: the
    // history must list only what actually left. The price, accepted on
    // purpose, is the moment in between. If the database fails right here, the
    // patient has the email and the dossier has no trace of it; the only
    // record is the masked `patient mail … sent` log line.
    const send = await this.prisma.patientEntrySend.create({
      data: {
        entryId,
        sentById: userId,
        toEmail: patient.email,
        locale,
        fileName,
      },
    });
    this.audit('entry.send', {
      patientId: id,
      entryId,
      sendId: send.id,
      userId,
    });
    return toPatientEntryDto(
      await this.prisma.patientEntry.findUniqueOrThrow({
        where: { id: entryId },
        include: ENTRY_INCLUDE,
      }),
    );
  }

  /**
   * Create a dossier from a lead and attach the lead to it.
   *
   * An address that already has a dossier is a 409 carrying the candidate,
   * not a silent merge: `module_patients.md` asked to "offer to link instead
   * of creating a duplicate", and one address is often a parent's, behind
   * whom two children are two medical records (audit A3, F4). Linking is the
   * separate, explicit `linkLead`.
   */
  async fromLead(dto: FromLeadDto): Promise<PatientDto> {
    const lead = await this.loadLead(dto);
    const email = normalizePatientEmail(lead.email);
    if (!email) throw new BadRequestException('lead_without_email');

    const existing = await this.prisma.patient.findUnique({
      where: { email },
      select: { id: true, fullName: true },
    });
    if (existing) {
      throw new ConflictException({
        message: 'patient_exists',
        patientId: existing.id,
        fullName: existing.fullName,
      });
    }

    const patient = await writeOrTranslate(() =>
      this.prisma.$transaction(async (tx) => {
        const created = await tx.patient.create({
          data: { fullName: lead.name, email },
        });
        await this.attachLead(dto, created.id, tx);
        return created;
      }),
    );
    this.audit('patient.fromLead', {
      patientId: patient.id,
      source: dto.source,
      sourceId: dto.sourceId,
    });
    return toPatientDto(patient);
  }

  /** Attach a lead to a dossier the operator picked, after a `fromLead` 409. */
  async linkLead(id: string, dto: FromLeadDto): Promise<PatientDto> {
    const patient = await this.getOrThrow(id);
    await this.loadLead(dto);
    await this.attachLead(dto, id, this.prisma);
    this.audit('patient.linkLead', {
      patientId: id,
      source: dto.source,
      sourceId: dto.sourceId,
    });
    return toPatientDto(patient);
  }

  /* --------------------------- helpers --------------------------- */

  private toData(dto: CreatePatientDto | UpdatePatientDto) {
    return {
      fullName: dto.fullName,
      phone: dto.phone,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      gender: dto.gender,
      notes: dto.notes,
      consentAt: dto.consentAt ? new Date(dto.consentAt) : undefined,
    };
  }

  private requireEmail(raw: string): string {
    const email = normalizePatientEmail(raw);
    if (!email) throw new BadRequestException('email_required');
    return email;
  }

  /**
   * Who did what to which record, with no PII in it — identifiers only.
   * Erasure and access to a medical document used to leave no trace at all
   * (audit A3, F23), which is the one thing a data-protection question about
   * a dossier cannot be answered without.
   */
  private audit(action: string, fields: Record<string, string>): void {
    const detail = Object.entries(fields)
      .map(([k, v]) => `${k}=${v}`)
      .join(' ');
    this.logger.log(`audit ${action} ${detail}`);
  }

  private async loadLead(
    dto: FromLeadDto,
  ): Promise<{ name: string; email: string }> {
    const select = { clientName: true, clientEmail: true } as const;
    const id = dto.sourceId;

    const row =
      dto.source === 'appointment'
        ? await this.prisma.appointment.findUnique({ where: { id }, select })
        : dto.source === 'subscription'
          ? await this.prisma.subscription.findUnique({ where: { id }, select })
          : dto.source === 'quick_question'
            ? await this.prisma.quickQuestion.findUnique({
                where: { id },
                select,
              })
            : await this.prisma.deliverableOrder.findUnique({
                where: { id },
                select,
              });

    if (!row) throw new NotFoundException('lead_not_found');
    return { name: row.clientName, email: row.clientEmail };
  }

  private async attachLead(
    dto: FromLeadDto,
    patientId: string,
    tx: Prisma.TransactionClient | PrismaService,
  ): Promise<void> {
    const where = { id: dto.sourceId };
    const data = { patientId };

    if (dto.source === 'appointment') {
      await tx.appointment.update({ where, data });
    } else if (dto.source === 'subscription') {
      await tx.subscription.update({ where, data });
    } else if (dto.source === 'quick_question') {
      await tx.quickQuestion.update({ where, data });
    } else {
      await tx.deliverableOrder.update({ where, data });
    }
  }

  /** A row pointing at a file that is not on disk is a missing document. */
  private async storedFileSize(path: string): Promise<number> {
    try {
      return (await stat(path)).size;
    } catch {
      throw new NotFoundException('document_not_found');
    }
  }

  private async getOrThrow(id: string) {
    const p = await this.prisma.patient.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('patient_not_found');
    return p;
  }

  private async getEntryOrThrow(patientId: string, entryId: string) {
    const e = await this.prisma.patientEntry.findUnique({
      where: { id: entryId },
    });
    if (!e || e.patientId !== patientId) {
      throw new NotFoundException('entry_not_found');
    }
    return e;
  }
}

/** `entry_file_not_allowed` or `entry_empty`, as a 422 with the code in `message`. */
function assertEntryContent(entry: EntryContent): void {
  const refusal = entryContentRefusal(entry);
  if (refusal) throw new UnprocessableEntityException(refusal);
}

/** Same body shape as the other coded errors: `message` is the code. */
function refusalException({ status, code, ...details }: SendRefusal) {
  return new HttpException(
    { statusCode: status, message: code, ...details },
    status,
  );
}
