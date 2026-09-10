import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ServiceDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { writeOrTranslate } from '../common/prisma-errors';
import {
  toPublicServiceDto,
  toServiceDto,
  type PublicServiceDto,
} from './services.mapper';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  /** The public catalog: what the client currently offers, and nothing else. */
  async findPublished(): Promise<PublicServiceDto[]> {
    const list = await this.prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    return list.map(toPublicServiceDto);
  }

  async findPublishedOne(id: string): Promise<PublicServiceDto> {
    const service = await this.prisma.service.findFirst({
      where: { id, active: true },
    });
    if (!service) throw new NotFoundException('service_not_found');
    return toPublicServiceDto(service);
  }

  /** Back office: everything, including what is currently switched off. */
  async findAll(): Promise<ServiceDto[]> {
    const list = await this.prisma.service.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return list.map(toServiceDto);
  }

  async create(dto: CreateServiceDto): Promise<ServiceDto> {
    if (await this.prisma.service.findUnique({ where: { code: dto.code } })) {
      throw new ConflictException('code_taken');
    }
    const service = await writeOrTranslate(() =>
      this.prisma.service.create({ data: dto }),
    );
    return toServiceDto(service);
  }

  async update(id: string, dto: UpdateServiceDto): Promise<ServiceDto> {
    await this.getOrThrow(id);
    const service = await writeOrTranslate(() =>
      this.prisma.service.update({ where: { id }, data: dto }),
    );
    return toServiceDto(service);
  }

  /**
   * Refused while anything the client has to answer for still points at it.
   * Appointments and subscriptions carry a required `serviceId`, so the delete
   * used to come back as a 500 from the foreign key (audit A4, F11) — with the
   * booking history intact and the operator none the wiser. Deactivating is
   * what she actually wants here, and the back office says so.
   */
  async remove(id: string): Promise<void> {
    await this.getOrThrow(id);
    const [appointments, subscriptions] = await Promise.all([
      this.prisma.appointment.count({ where: { serviceId: id } }),
      this.prisma.subscription.count({ where: { serviceId: id } }),
    ]);
    if (appointments + subscriptions > 0) {
      throw new ConflictException('service_in_use');
    }
    await writeOrTranslate(() => this.prisma.service.delete({ where: { id } }));
  }

  private async getOrThrow(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('service_not_found');
    return service;
  }
}
