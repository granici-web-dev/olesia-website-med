import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../auth/jwt.types';
import { Role, PaymentState } from '../../generated/prisma/enums';
import { PaymentsService } from './payments.service';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { ListPaymentsQueryDto } from './dto/list-payments-query.dto';

/** Payments ledger — admin/editor. */
@ApiTags('payments')
@ApiBearerAuth()
@Roles(Role.admin, Role.editor)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  findAll(@Query() query: ListPaymentsQueryDto) {
    return this.payments.findAll(query, query.state as PaymentState | undefined);
  }

  /** Everything one patient has ever paid for. */
  @Get('patient/:patientId')
  history(@Param('patientId') patientId: string) {
    return this.payments.historyForPatient(patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payments.findOne(id);
  }

  /** Re-ask the bank about one payment, for when a callback went missing. */
  @Post(':id/sync')
  async sync(@Param('id') id: string) {
    const p = await this.payments.findOne(id);
    await this.payments.syncFromBank(p.checkoutId);
    return this.payments.findOne(id);
  }

  @Roles(Role.admin)
  @Post(':id/refund')
  refund(
    @Param('id') id: string,
    @Body() dto: RefundPaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.payments.refund(id, dto.amount, dto.reason, user?.id);
  }
}
