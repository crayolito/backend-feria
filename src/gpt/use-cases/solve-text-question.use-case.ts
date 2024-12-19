import OpenAI from 'openai';
import { jsonrepair } from 'jsonrepair';
import { QuestionAnalysis } from '../dtos/text-question.dto';

interface QuestionOptions {
  question: string;
  subject?: string;
}

export const SolveTextQuestionUseCase = async (
  openai: OpenAI,
  options: QuestionOptions
): Promise<QuestionAnalysis> => {
  const { question, subject } = options;

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: 'Eres un profesor experto en todas las materias académicas. Proporciona respuestas detalladas y educativas. Responde en formato JSON con la siguiente estructura exacta: {"explanation": "explicación detallada", "answer": "respuesta concreta", "references": ["referencia1", "referencia2"], "confidence": 0.95}'
      },
      {
        role: "user",
        content: `${subject ? `[${subject}] ` : ''}${question}`
      }
    ],
    model: "gpt-3.5-turbo",
    temperature: 0.3
  });

  try {
    const content = completion.choices[0].message.content || '';
    
    // Intentamos encontrar el JSON en la respuesta
    let jsonString = content;
    if (!content.trim().startsWith('{')) {
      const matches = content.match(/\{[\s\S]*\}/);
      jsonString = matches ? matches[0] : content;
    }

    const repairedJson = jsonrepair(jsonString);
    const parsedResponse = JSON.parse(repairedJson);

    // Validamos la estructura de la respuesta
    if (!parsedResponse.explanation || !parsedResponse.answer) {
      return {
        explanation: content,
        answer: "Ver explicación detallada arriba",
        references: [],
        confidence: 0.7
      };
    }

    return parsedResponse;
  } catch (error) {
    console.error('Error al procesar la respuesta de OpenAI:', error);
    
    return {
      explanation: completion.choices[0].message.content || 'No se pudo procesar la respuesta',
      answer: "Ver explicación arriba",
      references: [],
      confidence: 0.5
    };
  }
};
