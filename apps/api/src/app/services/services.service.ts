import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ServiceDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { toServiceDto } from './services.mapper';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ServiceDto[]> {
    const list = await this.prisma.service.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return list.map(toServiceDto);
  }

  async findOne(id: string): Promise<ServiceDto> {
    return toServiceDto(await this.getOrThrow(id));
  }

  async create(dto: CreateServiceDto): Promise<ServiceDto> {
    if (await this.prisma.service.findUnique({ where: { code: dto.code } })) {
      throw new ConflictException('code_taken');
    }
    const service = await this.prisma.service.create({ data: dto });
    return toServiceDto(service);
  }

  async update(id: string, dto: UpdateServiceDto): Promise<ServiceDto> {
    await this.getOrThrow(id);
    const service = await this.prisma.service.update({
      where: { id },
      data: dto,
    });
    return toServiceDto(service);
  }

  async remove(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.prisma.service.delete({ where: { id } });
  }

  private async getOrThrow(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('service_not_found');
    return service;
  }
}
