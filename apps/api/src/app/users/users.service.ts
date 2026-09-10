import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import type { Paginated, UserDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { writeOrTranslate } from '../common/prisma-errors';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto';
import { toUserDto } from './users.mapper';
import { generateStarterPassword } from './starter-password';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
    // The lookup above answers the ordinary case; this covers the request that
    // races past it, which used to reach the client as a 500 (audit A5, F9).
    const user = await writeOrTranslate(() =>
      this.prisma.user.create({
        data: {
          email,
          name: dto.name,
          role: dto.role,
          passwordHash,
          mustChangePassword: true,
        },
      }),
    );
    return toUserDto(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    await this.getOrThrow(id);
    const user = await writeOrTranslate(() =>
      this.prisma.user.update({
        where: { id },
        data: { name: dto.name, role: dto.role, isActive: dto.isActive },
      }),
    );
    return toUserDto(user);
  }

  /**
   * Hand the account a new password and end every session it had. A reset is
   * what an admin reaches for when access has gone somewhere it should not
   * have, and leaving the old refresh tokens alive would make it pointless.
   */
  async resetPassword(id: string): Promise<{ password: string }> {
    await this.getOrThrow(id);
    const password = generateStarterPassword();
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: {
          passwordHash: await argon2.hash(password),
          mustChangePassword: true,
        },
      }),
      this.prisma.refreshSession.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return { password };
  }

  private async getOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('user_not_found');
    return user;
  }
}
