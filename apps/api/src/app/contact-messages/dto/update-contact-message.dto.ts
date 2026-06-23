import { IsEnum, IsOptional } from 'class-validator';

import { ContactMessageStatus } from '../../../generated/prisma/enums';

/**
 * Mutations the back office can apply to a Contact-form message. For now only
 * the read/unread state is editable from the portal; replying by email is a
 * follow-up step (needs SMTP), so `reply` is not accepted here yet.
 */
export class UpdateContactMessageDto {
  @IsOptional()
  @IsEnum(ContactMessageStatus)
  status?: ContactMessageStatus;
}
