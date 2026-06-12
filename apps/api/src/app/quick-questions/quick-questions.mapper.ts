import type { QuickQuestionDto } from '@olesia/shared';
import type { QuickQuestion } from '../../generated/prisma/client';

export function toQuickQuestionDto(q: QuickQuestion): QuickQuestionDto {
  return {
    id: q.id,
    clientName: q.clientName,
    clientEmail: q.clientEmail,
    phone: q.phone,
    question: q.question,
    attachments: q.attachments,
    answer: q.answer,
    status: q.status as QuickQuestionDto['status'],
    paymentStatus: q.paymentStatus as QuickQuestionDto['paymentStatus'],
    dueAt: q.dueAt.toISOString(),
    answeredAt: q.answeredAt ? q.answeredAt.toISOString() : null,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
  };
}
