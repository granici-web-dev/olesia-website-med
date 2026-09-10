import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import {
  StorageService,
  VIDEO_MAX_BYTES,
  type UploadedImage,
} from '../storage/storage.service';
import { uploadLimits } from '../storage/upload-limits';
import { SiteMediaService } from './site-media.service';
import { SetSiteMediaDto } from './dto/site-media.dto';

/**
 * The hero video, its poster and the page portraits.
 *
 * `GET /site-media` is public and returns only the slots that have been
 * replaced — the site holds the catalogue itself (`SITE_MEDIA_SLOTS`) and falls
 * back to the committed asset for anything absent.
 */
@ApiTags('site-media')
@Controller('site-media')
export class SiteMediaController {
  constructor(
    private readonly siteMedia: SiteMediaService,
    private readonly storage: StorageService,
  ) {}

  @Public()
  @Get()
  findAll() {
    return this.siteMedia.findAll();
  }

  /** Videos are stored as-is; see `saveVideo` for why they are not re-encoded. */
  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Post('video')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', uploadLimits(VIDEO_MAX_BYTES)))
  uploadVideo(@UploadedFile() file: UploadedImage) {
    return this.storage
      .saveVideo(file)
      .then(({ url }) => ({ url, name: file?.originalname ?? '' }));
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Put(':key')
  set(@Param('key') key: string, @Body() dto: SetSiteMediaDto) {
    return this.siteMedia.set(key, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Delete(':key')
  @HttpCode(204)
  reset(@Param('key') key: string) {
    return this.siteMedia.reset(key);
  }
}
