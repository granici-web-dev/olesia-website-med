import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import type { Paginated, UserDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto';
import { toUserDto } from './users.mapper';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/** Readable starter password for admin-created accounts. */
function generatePassword(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 12; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto): Promise<Paginated<UserDto>> {
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: [{ role: 'asc' }, { name: 'asc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.user.count(),
    ]);
    return paginate(items.map(toUserDto), total, query);
  }

  async findOneDto(id: string): Promise<UserDto> {
    return toUserDto(await this.getOrThrow(id));
  }

  async create(dto: CreateUserDto): Promise<UserDto> {
    const email = dto.email.toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException('email_taken');
    }
    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: { email, name: dto.name, role: dto.role, passwordHash },
    });
    return toUserDto(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    await this.getOrThrow(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { name: dto.name, role: dto.role, isActive: dto.isActive },
    });
    return toUserDto(user);
  }

  async resetPassword(id: string): Promise<{ password: string }> {
    await this.getOrThrow(id);
    const password = generatePassword();
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: await argon2.hash(password) },
    });
    return { password };
  }

  private async getOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('user_not_found');
    return user;
  }
}
