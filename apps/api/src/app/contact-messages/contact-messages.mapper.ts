import type { ContactMessageDto } from '@olesia/shared';
import type { ContactMessage } from '../../generated/prisma/client';

export function toContactMessageDto(m: ContactMessage): ContactMessageDto {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    subject: m.subject as ContactMessageDto['subject'],
    message: m.message,
    status: m.status as ContactMessageDto['status'],
    readAt: m.readAt ? m.readAt.toISOString() : null,
    reply: m.reply,
    repliedAt: m.repliedAt ? m.repliedAt.toISOString() : null,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}
