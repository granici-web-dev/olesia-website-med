import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import {
  StorageService,
  type StoredImage,
  type UploadedImage,
} from './storage.service';

/** Image uploads for content pages — authenticated staff only. */
@ApiTags('storage')
@ApiBearerAuth()
@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('upload')
  @Roles(Role.admin, Role.editor)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: UploadedImage): Promise<StoredImage> {
    return this.storage.saveImage(file);
  }
}
