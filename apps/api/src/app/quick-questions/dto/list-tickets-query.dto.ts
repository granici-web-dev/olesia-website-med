import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { QuickQuestionStatus } from '../../../generated/prisma/enums';

/**
 * `?page=&pageSize=&status=` for the EXPRESS ticket list.
 *
 * Without `status` the list leaves out `awaiting_payment` — see
 * `QuickQuestionsService.findAll`. Asking for that status by name is how the
 * back office's "Neachitate" tab is built.
 */
export class ListTicketsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(QuickQuestionStatus)
  status?: QuickQuestionStatus;
}
