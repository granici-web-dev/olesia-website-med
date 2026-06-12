import { PartialType } from '@nestjs/swagger';

import { CreateServiceDto } from './create-service.dto';

/** All fields optional — supports both full edits and `{ active }` toggles. */
export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
