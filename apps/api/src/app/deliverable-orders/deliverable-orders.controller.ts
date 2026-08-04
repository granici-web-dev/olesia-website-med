import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { DeliverableOrdersService } from './deliverable-orders.service';
import { UpdateDeliverableOrderDto } from './dto/update-deliverable-order.dto';

/** Orders for personalized menus and protocols ("Comenzi") — admin/editor. */
@ApiTags('deliverable-orders')
@ApiBearerAuth()
@Roles(Role.admin, Role.editor)
@Controller('deliverable-orders')
export class DeliverableOrdersController {
  constructor(private readonly orders: DeliverableOrdersService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.orders.findAll(query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeliverableOrderDto) {
    return this.orders.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.orders.remove(id);
  }
}
