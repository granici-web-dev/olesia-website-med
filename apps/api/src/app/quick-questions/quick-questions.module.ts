import { Module } from '@nestjs/common';

import { QuickQuestionsService } from './quick-questions.service';
import { QuickQuestionsController } from './quick-questions.controller';

@Module({
  controllers: [QuickQuestionsController],
  providers: [QuickQuestionsService],
})
export class QuickQuestionsModule {}
