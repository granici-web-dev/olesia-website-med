import { Module } from '@nestjs/common';

import { QuickQuestionsService } from './quick-questions.service';
import { QuickQuestionsController } from './quick-questions.controller';
import { QuickQuestionsPurgeService } from './quick-questions.purge';

@Module({
  controllers: [QuickQuestionsController],
  providers: [QuickQuestionsService, QuickQuestionsPurgeService],
})
export class QuickQuestionsModule {}
