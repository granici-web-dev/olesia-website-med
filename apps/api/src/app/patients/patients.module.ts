import { Module } from '@nestjs/common';

import { StorageModule } from '../storage/storage.module';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';

@Module({
  imports: [StorageModule],
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}
