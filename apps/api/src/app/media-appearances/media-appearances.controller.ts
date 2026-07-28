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
import { MediaAppearancesService } from './media-appearances.service';
import {
  CreateMediaAppearanceDto,
  ThumbnailFromUrlDto,
  UpdateMediaAppearanceDto,
} from './dto/media-appearance.dto';

/**
 * TV/radio/conference appearances behind the public /media page.
 *
 * Same public/admin split as the other content modules: `GET /media-appearances`
 * serves the site with published entries only, `GET /media-appearances/all`
 * serves the back office.
 */
@ApiTags('media-appearances')
@Controller('media-appearances')
export class MediaAppearancesController {
  constructor(private readonly media: MediaAppearancesService) {}

  @Public()
  @Get()
  findPublished() {
    return this.media.findPublished();
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Get('all')
  findAll() {
    return this.media.findAll();
  }

  /**
   * Copy a YouTube thumbnail into our own storage. Lets the back office fill
   * the thumbnail from a pasted link instead of asking for a screenshot.
   */
  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Post('thumbnail')
  thumbnail(@Body() dto: ThumbnailFromUrlDto) {
    return this.media.thumbnailFromUrl(dto.url);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Post()
  create(@Body() dto: CreateMediaAppearanceDto) {
    return this.media.create(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMediaAppearanceDto) {
    return this.media.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.media.remove(id);
  }
}
