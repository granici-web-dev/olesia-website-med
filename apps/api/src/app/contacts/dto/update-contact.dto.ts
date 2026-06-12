import { PartialType } from '@nestjs/swagger';

import { CreateContactDto } from './create-contact.dto';

/** All fields optional — supports full edits and `{ active }` toggles. */
export class UpdateContactDto extends PartialType(CreateContactDto) {}
