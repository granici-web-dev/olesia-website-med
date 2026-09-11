import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { legalEntity } from '../common/legal-entity';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

/** Contact blocks (module_calendly.md §9). GET is public; writes admin/editor. */
@ApiTags('contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contacts: ContactsService) {}

  @Public()
  @Get()
  findPublished() {
    return this.contacts.findPublished();
  }

  /**
   * The registered entity behind the practice, for the pages legally required
   * to name it (/gdpr, /terms).
   *
   * Its own route rather than a field on the list above: three of the four
   * readers of `GET /contacts` want contact blocks and nothing else, and
   * wrapping the array to serve two pages would change the shape for all of
   * them. Public, because it is on two public pages already.
   *
   * Empty strings while the client's incorporation is outstanding. The site
   * derives its draft banner from that emptiness rather than from a flag —
   * see `PRINCIPLES.md`, "a placeholder must be visible, and derived".
   */
  @Public()
  @Get('legal-entity')
  legalEntity() {
    return legalEntity();
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Get('all')
  findAll() {
    return this.contacts.findAll();
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.contacts.create(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.contacts.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.contacts.remove(id);
  }
}
