import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../../generated/prisma/enums';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { TotpService } from '../auth/totp.service';
import type { AuthUser } from '../auth/jwt.types';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/** Back-office user management — admin only (module_calendly.md §4). */
@ApiTags('users')
@ApiBearerAuth()
@Roles(Role.admin)
@Controller('users')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly totp: TotpService,
  ) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.users.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  /**
   * The actor is passed down because two of the three refusals are about who
   * is asking: an admin may not demote or deactivate herself (audit A5, F1).
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.users.update(id, dto, actor.id);
  }

  @Post(':id/reset-password')
  @HttpCode(200)
  resetPassword(@Param('id') id: string) {
    return this.users.resetPassword(id);
  }

  /**
   * Clear someone's second factor after they lost the phone and the recovery
   * codes. Not available on oneself: with a single admin account that path
   * would defeat the second factor rather than recover it, and the way out of
   * that corner is in docs/deployment.md.
   */
  @Post(':id/2fa/reset')
  @HttpCode(204)
  resetTotp(@Param('id') id: string, @CurrentUser() actor: AuthUser) {
    return this.totp.resetFor(id, actor.id);
  }
}
