import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';

import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import {
  DOCUMENT_MAX_BYTES,
  StorageService,
  type UploadedImage,
} from '../storage/storage.service';
import { uploadLimits } from '../storage/upload-limits';
import { MaterialsService } from './materials.service';
import { MaterialGrantsService } from './material-grants.service';
import {
  CreateMaterialCategoryDto,
  CreateMaterialDto,
  UpdateMaterialCategoryDto,
  UpdateMaterialDto,
} from './dto/material.dto';

/**
 * Biblioteca digitală — the downloadable materials behind /guides.
 *
 * Public GETs serve the storefront with published materials only; the back
 * office reads `/materials/all`. Categories are public too: the storefront
 * filter needs them, and there is nothing sensitive in a taxonomy.
 */
@ApiTags('materials')
@Controller('materials')
export class MaterialsController {
  constructor(
    private readonly materials: MaterialsService,
    private readonly grants: MaterialGrantsService,
    private readonly storage: StorageService,
  ) {}

  @Public()
  @Get()
  findPublished() {
    return this.materials.findPublished();
  }

  @Public()
  @Get('categories')
  findCategories() {
    return this.materials.findCategories();
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Get('all')
  findAll() {
    return this.materials.findAll();
  }

  /**
   * The paid file itself, streamed out of private storage.
   *
   * Public because the token is the whole credential — there are no buyer
   * accounts — and `no-store` because that token is in the path, so the cache
   * key of any shared proxy in front of us would be the credential itself.
   * Unknown, expired and exhausted are one answer, per `PRINCIPLES.md`.
   */
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @Get('download/:token')
  @Header('Cache-Control', 'no-store')
  async download(@Param('token') token: string, @Res() res: Response) {
    const { path, fileName } = await this.grants.fileForToken(token);
    res.download(path, fileName);
  }

  /** The live download link for one payment, so an operator can re-send it. */
  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Get('grant/payment/:paymentId')
  grantForPayment(@Param('paymentId') paymentId: string) {
    return this.grants.linkForPayment(paymentId);
  }

  /**
   * Upload the PDF of a FREE material. Public on purpose — these are marketing
   * downloads, not patient documents, and the storefront links them directly.
   */
  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Post('file')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', uploadLimits(DOCUMENT_MAX_BYTES)))
  uploadFile(@UploadedFile() file: UploadedImage) {
    return this.storage
      .saveDocument(file)
      .then(({ url }) => ({ url, name: file?.originalname ?? '' }));
  }

  /**
   * Upload the PDF of a PAID material, into private storage.
   *
   * A separate route rather than a flag on the one above, because the two
   * store into different volumes and answer with different things — a public
   * URL, or an opaque key. Mixing them would make "which directory is this
   * file in" a runtime question about a request body.
   */
  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Post('file/private')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', uploadLimits(DOCUMENT_MAX_BYTES)))
  uploadPrivateFile(@UploadedFile() file: UploadedImage) {
    return this.storage
      .savePrivateDocument(file)
      .then(({ key }) => ({ key, name: file?.originalname ?? '' }));
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Post('categories')
  createCategory(@Body() dto: CreateMaterialCategoryDto) {
    return this.materials.createCategory(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Patch('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateMaterialCategoryDto,
  ) {
    return this.materials.updateCategory(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Delete('categories/:id')
  @HttpCode(204)
  removeCategory(@Param('id') id: string) {
    return this.materials.removeCategory(id);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Post()
  create(@Body() dto: CreateMaterialDto) {
    return this.materials.create(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.materials.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.admin, Role.editor)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.materials.remove(id);
  }
}
