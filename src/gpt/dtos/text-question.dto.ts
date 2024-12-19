import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export interface QuestionAnalysis {
  explanation: string;
  answer: string;
  references?: string[];
  confidence: number;
}

export class TextQuestionDto {
  @ApiProperty({
    description: 'Pregunta o problema a resolver',
    example: '¿Cuál es la capital de Francia?',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'Materia o tema de la pregunta',
    example: 'geografía',
    required: false
  })
  @IsString()
  @IsOptional()
  subject?: string;
}