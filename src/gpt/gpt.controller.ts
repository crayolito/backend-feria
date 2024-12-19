import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { HomeworkQuestionDto } from './dtos/homework-question.dto';
import { QuestionAnalysis, TextQuestionDto } from './dtos/text-question.dto';
import { GptService } from './gpt.service';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('solve-text')
  async solveTextQuestion(
    @Body() questionDto: TextQuestionDto,
  ): Promise<QuestionAnalysis> {
    try {
      return await this.gptService.solveTextQuestion(questionDto);
    } catch (error) {
      throw new HttpException(
        `Error al resolver la pregunta: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('solve-homework')
  async solveHomework(@Body() questionDto: HomeworkQuestionDto) {
    try {
      return await this.gptService.solveHomework(questionDto);
    } catch (error) {
      throw new HttpException(
        `Error al resolver el ejercicio: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
