import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../auth/jwt.types';
import { Role, PaymentState, PaymentTargetType } from '../../generated/prisma/enums';
import { PaymentsService } from './payments.service';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { RecordManualPaymentDto } from './dto/manual-payment.dto';
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

  /** Every payment recorded against one purchase. */
  @Get('target/:targetType/:targetId')
  targetHistory(
    @Param('targetType', new ParseEnumPipe(PaymentTargetType))
    targetType: PaymentTargetType,
    @Param('targetId') targetId: string,
  ) {
    return this.payments.historyForTarget(targetType, targetId);
  }

  /**
   * Money that arrived outside the bank. Admin only: this is the one way to
   * mark a purchase paid without a bank saying so, and it replaces the three
   * PATCH endpoints that used to set `paymentStatus` by hand (audit A5, F3).
   */
  @Roles(Role.admin)
  @Post('manual')
  recordManual(
    @Body() dto: RecordManualPaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.payments.recordManual({ ...dto, authorId: user.id });
  }

  /** Undo a manual payment recorded in error. Bank payments are refunded. */
  @Roles(Role.admin)
  @Post(':id/void')
  voidManual(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.payments.voidManual(id, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payments.findOne(id);
  }

  /** Re-ask the bank about one payment, for when a callback went missing. */
  @Post(':id/sync')
  async sync(@Param('id') id: string) {
    const p = await this.payments.findOne(id);
    // A manual payment has no checkout session; there is nobody to ask.
    if (!p.checkoutId) throw new BadRequestException('not_a_bank_payment');
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
    return this.payments.refund(id, dto.amount, dto.reason, user.id);
  }
}
