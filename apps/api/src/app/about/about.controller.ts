import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { AboutService } from './about.service';
import { UpdateAboutDto } from './dto/update-about.dto';

/** About page (module_calendly.md §10). GET is public; PATCH admin/editor. */
@ApiTags('about')
@Controller('about')
export class AboutController {
  constructor(private readonly about: AboutService) {}

  @Public()
  @Get()
  get() {
    return this.about.get();
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Patch()
  update(@Body() dto: UpdateAboutDto) {
    return this.about.update(dto);
  }
}
