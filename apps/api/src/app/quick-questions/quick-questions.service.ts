import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AnsweredQuickQuestionDto,
  Paginated,
  QuickQuestionDto,
} from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { PatientNotificationsService } from '../mail/patient-notifications.service';
import { paginate } from '../common/dto/pagination.dto';
import { QuickQuestionStatus } from '../../generated/prisma/enums';
import { toQuickQuestionDto } from './quick-questions.mapper';
import { AnswerTicketDto } from './dto/quick-question.dto';
import { ListTicketsQueryDto } from './dto/list-tickets-query.dto';

/**
 * What paying turns an EXPRESS ticket into, given what it is now.
 *
 * The pure part of the fulfilment branch in `PaymentsService.activateTicket`,
 * exported so the one rule that matters can be pinned without a bank, a
 * database or a clock: **a ticket that is not `awaiting_payment` is not
 * touched**. maib may deliver the same success notification more than once and
 * the reconcile sweep writes the same transition from the other side, so an
 * unconditional write would walk an answered ticket back to `open` and hand
 * the doctor a deadline she has already met.
 *
 * Returns what to write, or null for "leave it alone".
 */
export function activateTicketData(
  current: QuickQuestionStatus,
  dueAt: Date,
): { status: QuickQuestionStatus; dueAt: Date } | null {
  return current === QuickQuestionStatus.awaiting_payment
    ? { status: QuickQuestionStatus.open, dueAt }
    : null;
}

@Injectable()
export class QuickQuestionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: PatientNotificationsService,
  ) {}

  /**
   * The doctor's list. Unpaid tickets are excluded unless she asks for them by
   * name: `awaiting_payment` means somebody typed a question and never paid,
   * and mixing those into the working list would make the EXPRESS queue read as
   * longer than the work it represents.
   */
  async findAll(
    query: ListTicketsQueryDto,
  ): Promise<Paginated<QuickQuestionDto>> {
    const where = query.status
      ? { status: query.status }
      : { status: { not: QuickQuestionStatus.awaiting_payment } };

    const [items, total] = await Promise.all([
      this.prisma.quickQuestion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.quickQuestion.count({ where }),
    ]);
    return paginate(items.map(toQuickQuestionDto), total, query);
  }

  /**
   * Save the doctor's answer and send it to the patient.
   *
   * The saving and the sending are reported separately, and the caller shows
   * both. The site promises "a written answer within ~1 hour"; this used to
   * write it to a column and say "sent to the client" in three places of the
   * back office, so the doctor closed the ticket believing a parent had read
   * something that had never left the database (audit A3, F2).
   *
   * An unpaid ticket is refused rather than hidden behind a disabled button.
   * The back office greys the box out, but the button is not the rule — the
   * whole promise of the EXPRESS flow is that no answer leaves before the money
   * arrives, and that has to hold against a stale tab as well as a careful one.
   */
  async answer(
    id: string,
    dto: AnswerTicketDto,
  ): Promise<AnsweredQuickQuestionDto> {
    const ticket = await this.getOrThrow(id);
    if (ticket.status === QuickQuestionStatus.awaiting_payment) {
      throw new BadRequestException('ticket_awaiting_payment');
    }

    const saved = await this.prisma.quickQuestion.update({
      where: { id },
      data: {
        answer: dto.answer,
        status: QuickQuestionStatus.answered,
        answeredAt: new Date(),
      },
    });

    const { sent } = await this.notifications.answerToQuestion(
      { to: ticket.clientEmail, locale: ticket.locale },
      {
        clientName: ticket.clientName,
        question: ticket.question,
        answer: dto.answer,
      },
    );

    return { ...toQuickQuestionDto(saved), emailSent: sent };
  }

  private async getOrThrow(id: string) {
    const ticket = await this.prisma.quickQuestion.findUnique({
      where: { id },
    });
    if (!ticket) throw new NotFoundException('ticket_not_found');
    return ticket;
  }
}
