import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
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
  DOCUMENT_MAX_BYTES,
  StorageService,
  type UploadedImage,
} from '../storage/storage.service';
import { uploadLimits } from '../storage/upload-limits';
import { MaterialsService } from './materials.service';
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
   * Upload the PDF of a material. Public on purpose — these are marketing
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
