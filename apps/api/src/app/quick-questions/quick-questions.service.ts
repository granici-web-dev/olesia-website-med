import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AnsweredQuickQuestionDto,
  Paginated,
  QuickQuestionDto,
} from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { PatientNotificationsService } from '../mail/patient-notifications.service';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto';
import { toQuickQuestionDto } from './quick-questions.mapper';
import { AnswerTicketDto, UpdateTicketDto } from './dto/quick-question.dto';

@Injectable()
export class QuickQuestionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: PatientNotificationsService,
  ) {}

  async findAll(
    query: PaginationQueryDto,
  ): Promise<Paginated<QuickQuestionDto>> {
    const [items, total] = await Promise.all([
      this.prisma.quickQuestion.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.quickQuestion.count(),
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
   */
  async answer(
    id: string,
    dto: AnswerTicketDto,
  ): Promise<AnsweredQuickQuestionDto> {
    const ticket = await this.getOrThrow(id);
    const saved = await this.prisma.quickQuestion.update({
      where: { id },
      data: {
        answer: dto.answer,
        status: 'answered',
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

  async update(id: string, dto: UpdateTicketDto): Promise<QuickQuestionDto> {
    await this.getOrThrow(id);
    return toQuickQuestionDto(
      await this.prisma.quickQuestion.update({
        where: { id },
        data: { paymentStatus: dto.paymentStatus },
      }),
    );
  }

  private async getOrThrow(id: string) {
    const ticket = await this.prisma.quickQuestion.findUnique({
      where: { id },
    });
    if (!ticket) throw new NotFoundException('ticket_not_found');
    return ticket;
  }
}
