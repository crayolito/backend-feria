import { Module } from '@nestjs/common';
import { GptController } from './gpt.controller';
import { GptService } from './gpt.service';

@Module({
  controllers: [GptController],
  providers: [GptService],
  exports: [GptService],
  imports: [],
})
export class GptModule {}
