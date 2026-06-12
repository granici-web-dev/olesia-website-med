import { Injectable, NotFoundException } from '@nestjs/common';
import type { ContactDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { toContactDto } from './contacts.mapper';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

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
