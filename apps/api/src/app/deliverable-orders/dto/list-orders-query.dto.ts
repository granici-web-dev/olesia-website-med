import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { DeliverableOrderStatus } from '../../../generated/prisma/enums';

/**
 * `?page=&pageSize=&status=` for the "Comenzi" list.
 *
 * Without `status` the list leaves out `awaiting_payment` — see
 * `DeliverableOrdersService.findAll`. Asking for that status by name is how
 * the back office's "Neachitate" tab is built, the same way the EXPRESS one is.
 */
export class ListOrdersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(DeliverableOrderStatus)
  status?: DeliverableOrderStatus;
}
