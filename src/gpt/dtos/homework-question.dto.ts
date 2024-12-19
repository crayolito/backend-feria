import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export interface HomeworkAnalysis {
  solution: string;
  steps: string[];
  answer: string;
  confidence: number;
}

export class HomeworkQuestionDto {
  @ApiProperty({
    description: 'Imagen del problema académico en formato base64',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  imageBase64: string;

  @ApiProperty({
    description: 'Materia o asignatura del problema (opcional)',
    example: 'matemáticas',
    required: false,
  })
  @IsString()
  @IsOptional()
  subject?: string;
}
