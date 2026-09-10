import { Injectable, NotFoundException } from '@nestjs/common';
import type { ContactDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { toContactDto } from './contacts.mapper';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * The public block: only what the client currently wants reached. A phone
   * number she switched off stayed on the endpoint (audit A4, F16), which is
   * only harmless for as long as nothing reads it — and the footer is about to
   * (`PLAN.md` A6).
   */
  async findPublished(): Promise<ContactDto[]> {
    const list = await this.prisma.contact.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    return list.map(toContactDto);
  }

  /** Back office: everything, including what is currently switched off. */
  async findAll(): Promise<ContactDto[]> {
    const list = await this.prisma.contact.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return list.map(toContactDto);
  }

  async create(dto: CreateContactDto): Promise<ContactDto> {
    return toContactDto(await this.prisma.contact.create({ data: dto }));
  }

  async update(id: string, dto: UpdateContactDto): Promise<ContactDto> {
    await this.getOrThrow(id);
    return toContactDto(
      await this.prisma.contact.update({ where: { id }, data: dto }),
    );
  }

  async remove(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.prisma.contact.delete({ where: { id } });
  }

  private async getOrThrow(id: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException('contact_not_found');
    return contact;
  }
}
