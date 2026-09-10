import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  Paginated,
  PatientDto,
  PatientEntryDto,
  PatientInteractionDto,
} from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService, type UploadedImage } from '../storage/storage.service';
import { paginate } from '../common/dto/pagination.dto';
import { PatientEntryType } from '../../generated/prisma/enums';
import { Prisma } from '../../generated/prisma/client';
import { toPatientDto, toPatientEntryDto } from './patients.mapper';
import {
  CreatePatientDto,
  ListPatientsDto,
  UpdatePatientDto,
} from './dto/patient.dto';
import { CreateEntryDto, UpdateEntryDto } from './dto/entry.dto';
import { FromLeadDto } from './dto/from-lead.dto';

/** Placeholders written over a linked lead's PII during GDPR erasure. */
const ANON_NAME = 'Pacient șters';
const ANON_EMAIL = 'sters@gdpr.local';
const ANON_TEXT = '[conținut șters la cererea de ștergere]';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /** Upload a private medical document → a `document` timeline entry. */
  async addDocument(
    id: string,
    file: UploadedImage | undefined,
    title?: string,
    authorId?: string,
  ): Promise<PatientEntryDto> {
    await this.getOrThrow(id);
    const { key } = await this.storage.savePrivateDocument(file);
    return toPatientEntryDto(
      await this.prisma.patientEntry.create({
        data: {
          patientId: id,
          type: PatientEntryType.document,
          title: title ?? file!.originalname,
          fileUrl: key,
          fileName: file!.originalname,
          authorId: authorId ?? null,
        },
      }),
    );
  }

  /** Resolve a private document for streaming (auth-checked by the route). */
  async getDocument(
    id: string,
    entryId: string,
  ): Promise<{ path: string; fileName: string }> {
    const e = await this.getEntryOrThrow(id, entryId);
    if (e.type !== PatientEntryType.document || !e.fileUrl) {
      throw new NotFoundException('document_not_found');
    }
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
    const entryCount = await this.prisma.patientEntry.count({
      where: { patientId: id },
    });
    return toPatientDto(p, { entryCount });
  }

  async create(dto: CreatePatientDto): Promise<PatientDto> {
    if (await this.prisma.patient.findUnique({ where: { email: dto.email } })) {
      throw new ConflictException('email_taken');
    }
    // `toData` widens shared fields to optional (it also serves updates); on
    // create, re-assert the required identity fields from the DTO.
    return toPatientDto(
      await this.prisma.patient.create({
        data: { ...this.toData(dto), fullName: dto.fullName, email: dto.email },
      }),
    );
  }

  async update(id: string, dto: UpdatePatientDto): Promise<PatientDto> {
    await this.getOrThrow(id);
    if (dto.email) {
      const clash = await this.prisma.patient.findUnique({
        where: { email: dto.email },
      });
      if (clash && clash.id !== id) throw new ConflictException('email_taken');
    }
    return toPatientDto(
      await this.prisma.patient.update({ where: { id }, data: this.toData(dto) }),
    );
  }

  /**
   * GDPR erasure (right to be forgotten). Removes every trace of the person:
   * - deletes the patient (cascades `PatientEntry` rows) and the physical
   *   private document files those entries point to;
   * - anonymizes the PII on linked leads (name/email + free-text medical
   *   fields) and detaches them, keeping only non-identifying business data;
   * - deletes the public files attached to linked quick questions;
   * - deletes the patient upload links and everything sent through them, rows
   *   and bytes. A link carries the name, email and a working token of its own,
   *   so anonymizing the appointment behind it would leave all three standing.
   * The DB mutations run in one transaction; disk cleanup is best-effort.
   */
  async remove(id: string): Promise<void> {
    const patient = await this.getOrThrow(id);

    // Capture file references BEFORE the cascade/anonymization removes them.
    const [docs, qqs, plans] = await Promise.all([
      this.prisma.patientEntry.findMany({
        where: {
          patientId: id,
          type: PatientEntryType.document,
          fileUrl: { not: null },
        },
        select: { fileUrl: true },
      }),
      this.prisma.quickQuestion.findMany({
        where: { patientId: id },
        select: { attachments: true },
      }),
      this.prisma.appointment.findMany({
        where: { patientId: id, planFileKey: { not: null } },
        select: { planFileKey: true },
      }),
    ]);

    // Upload links reach the patient two ways: through the appointment they
    // were issued for, and — for a group-C order, which carries no patient id —
    // through the email the order was placed with.
    const links = await this.prisma.uploadLink.findMany({
      where: {
        OR: [
          { appointment: { patientId: id } },
          { order: { clientEmail: patient.email } },
        ],
      },
      select: { id: true, documents: { select: { fileKey: true } } },
    });

    await this.prisma.$transaction([
      // Documents cascade with their link.
      this.prisma.uploadLink.deleteMany({
        where: { id: { in: links.map((l) => l.id) } },
      }),
      this.prisma.appointment.updateMany({
        where: { patientId: id },
        data: {
          clientName: ANON_NAME,
          clientEmail: ANON_EMAIL,
          reason: null,
          // Treatment plan is medical data — erase text + detach the file.
          planText: null,
          planFileKey: null,
          planFileName: null,
          planUploadedAt: null,
          patientId: null,
        },
      }),
      this.prisma.subscription.updateMany({
        where: { patientId: id },
        data: {
          clientName: ANON_NAME,
          clientEmail: ANON_EMAIL,
          patientId: null,
        },
      }),
      this.prisma.quickQuestion.updateMany({
        where: { patientId: id },
        data: {
          clientName: ANON_NAME,
          clientEmail: ANON_EMAIL,
          question: ANON_TEXT,
          answer: null,
          attachments: [],
          patientId: null,
        },
      }),
      this.prisma.patient.delete({ where: { id } }),
    ]);

    // Best-effort physical cleanup — outside the transaction (disk ops).
    await Promise.all([
      ...docs.map((d) => this.storage.deletePrivateDocument(d.fileUrl!)),
      ...plans.map((p) => this.storage.deletePrivateDocument(p.planFileKey!)),
      ...links
        .flatMap((l) => l.documents)
        .map((d) => this.storage.deletePrivateDocument(d.fileKey)),
      ...qqs
        .flatMap((q) => q.attachments)
        .map((url) => this.storage.deletePublicFile(url)),
    ]);
  }

  /** Merged medical-record timeline: entries + linked lead interactions. */
  async timeline(id: string): Promise<{
    entries: PatientEntryDto[];
    interactions: PatientInteractionDto[];
  }> {
    await this.getOrThrow(id);
    const [entries, appts, subs, qqs] = await Promise.all([
      this.prisma.patientEntry.findMany({
        where: { patientId: id },
        orderBy: { occurredAt: 'desc' },
      }),
      this.prisma.appointment.findMany({ where: { patientId: id } }),
      this.prisma.subscription.findMany({ where: { patientId: id } }),
      this.prisma.quickQuestion.findMany({ where: { patientId: id } }),
    ]);

    const interactions: PatientInteractionDto[] = [
      ...appts.map((a) => ({
        source: 'appointment' as const,
        sourceId: a.id,
        label: a.reason ?? 'Consultație',
        occurredAt: a.startTime.toISOString(),
        status: a.status,
        paymentStatus: a.paymentStatus as PatientInteractionDto['paymentStatus'],
      })),
      ...subs.map((s) => ({
        source: 'subscription' as const,
        sourceId: s.id,
        label: 'Monitorizare',
        occurredAt: s.startsAt.toISOString(),
        status: s.status,
        paymentStatus: s.paymentStatus as PatientInteractionDto['paymentStatus'],
      })),
      ...qqs.map((q) => ({
        source: 'quick_question' as const,
        sourceId: q.id,
        label: 'Întrebare rapidă',
        occurredAt: q.createdAt.toISOString(),
        status: q.status,
        paymentStatus: q.paymentStatus as PatientInteractionDto['paymentStatus'],
      })),
    ].sort((x, y) => y.occurredAt.localeCompare(x.occurredAt));

    return { entries: entries.map(toPatientEntryDto), interactions };
  }

  async addEntry(
    id: string,
    dto: CreateEntryDto,
    authorId?: string,
  ): Promise<PatientEntryDto> {
    await this.getOrThrow(id);
    return toPatientEntryDto(
      await this.prisma.patientEntry.create({
        data: {
          patientId: id,
          type: dto.type,
          title: dto.title ?? null,
          body: dto.body ?? null,
          occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
          authorId: authorId ?? null,
        },
      }),
    );
  }

  async updateEntry(
    id: string,
    entryId: string,
    dto: UpdateEntryDto,
  ): Promise<PatientEntryDto> {
    await this.getEntryOrThrow(id, entryId);
    return toPatientEntryDto(
      await this.prisma.patientEntry.update({
        where: { id: entryId },
        data: {
          type: dto.type,
          title: dto.title,
          body: dto.body,
          ...(dto.occurredAt ? { occurredAt: new Date(dto.occurredAt) } : {}),
        },
      }),
    );
  }

  async removeEntry(id: string, entryId: string): Promise<void> {
    const e = await this.getEntryOrThrow(id, entryId);
    await this.prisma.patientEntry.delete({ where: { id: entryId } });
    // Right-to-erasure also applies per entry: drop the physical file.
    if (e.type === PatientEntryType.document && e.fileUrl) {
      await this.storage.deletePrivateDocument(e.fileUrl);
    }
  }

  /**
   * Create-or-link a patient from a paid lead and attach the lead to them.
   * Matches an existing patient by email to avoid duplicates.
   */
  async fromLead(dto: FromLeadDto): Promise<PatientDto> {
    const lead = await this.loadLead(dto);
    const patient = await this.prisma.patient.upsert({
      where: { email: lead.email },
      create: { fullName: lead.name, email: lead.email },
      update: {},
    });
    await this.attachLead(dto, patient.id);
    return toPatientDto(patient);
  }

  /* --------------------------- helpers --------------------------- */

  private toData(dto: CreatePatientDto | UpdatePatientDto) {
    return {
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      gender: dto.gender,
      notes: dto.notes,
      consentAt: dto.consentAt ? new Date(dto.consentAt) : undefined,
    };
  }

  private async loadLead(dto: FromLeadDto): Promise<{ name: string; email: string }> {
    if (dto.source === 'appointment') {
      const a = await this.prisma.appointment.findUnique({ where: { id: dto.sourceId } });
      if (!a) throw new NotFoundException('lead_not_found');
      return { name: a.clientName, email: a.clientEmail };
    }
    if (dto.source === 'subscription') {
      const s = await this.prisma.subscription.findUnique({ where: { id: dto.sourceId } });
      if (!s) throw new NotFoundException('lead_not_found');
      return { name: s.clientName, email: s.clientEmail };
    }
    const q = await this.prisma.quickQuestion.findUnique({ where: { id: dto.sourceId } });
    if (!q) throw new NotFoundException('lead_not_found');
    return { name: q.clientName, email: q.clientEmail };
  }

  private async attachLead(dto: FromLeadDto, patientId: string): Promise<void> {
    if (dto.source === 'appointment') {
      await this.prisma.appointment.update({ where: { id: dto.sourceId }, data: { patientId } });
    } else if (dto.source === 'subscription') {
      await this.prisma.subscription.update({ where: { id: dto.sourceId }, data: { patientId } });
    } else {
      await this.prisma.quickQuestion.update({ where: { id: dto.sourceId }, data: { patientId } });
    }
  }

  private async getOrThrow(id: string) {
    const p = await this.prisma.patient.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('patient_not_found');
    return p;
  }

  private async getEntryOrThrow(patientId: string, entryId: string) {
    const e = await this.prisma.patientEntry.findUnique({ where: { id: entryId } });
    if (!e || e.patientId !== patientId) {
      throw new NotFoundException('entry_not_found');
    }
    return e;
  }
}
