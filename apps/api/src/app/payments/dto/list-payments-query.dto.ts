import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PaymentState } from '../../../generated/prisma/enums';

/** `?page=&pageSize=&state=` for the payments ledger. */
export class ListPaymentsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(PaymentState)
  state?: PaymentState;
}
