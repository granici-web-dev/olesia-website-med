import { Injectable, NotFoundException } from '@nestjs/common';
import type { ContactMessageDto, Paginated } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto';
import { ContactMessageStatus } from '../../generated/prisma/enums';
import { toContactMessageDto } from './contact-messages.mapper';
import { UpdateContactMessageDto } from './dto/update-contact-message.dto';

/**
 * Back-office inbox for the public Contact form ("Mesaje"). Messages are
 * created by the public `LeadsService`; here the doctor lists, opens (read),
 * and deletes them. Email replies are a follow-up step (needs SMTP).
 */
@Injectable()
export class ContactMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PaginationQueryDto,
  ): Promise<Paginated<ContactMessageDto>> {
    const [items, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.contactMessage.count(),
    ]);
    return paginate(items.map(toContactMessageDto), total, query);
  }

  /**
   * Patch the read/unread state. Setting `read` stamps `readAt` once; a
   * `replied` message is never silently demoted back to `new`/`read`.
   */
  async update(
    id: string,
    dto: UpdateContactMessageDto,
  ): Promise<ContactMessageDto> {
    const existing = await this.getOrThrow(id);

    const data: {
      status?: ContactMessageStatus;
      readAt?: Date | null;
    } = {};

    if (dto.status && dto.status !== existing.status) {
      data.status = dto.status;
      if (dto.status === ContactMessageStatus.read && !existing.readAt) {
        data.readAt = new Date();
      }
      if (dto.status === ContactMessageStatus.new) {
        data.readAt = null;
      }
    }

    if (Object.keys(data).length === 0) {
      return toContactMessageDto(existing);
    }

    return toContactMessageDto(
      await this.prisma.contactMessage.update({ where: { id }, data }),
    );
  }

  async remove(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.prisma.contactMessage.delete({ where: { id } });
  }

  private async getOrThrow(id: string) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
    });
    if (!message) throw new NotFoundException('contact_message_not_found');
    return message;
  }
}
