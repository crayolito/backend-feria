
import OpenAI from 'openai';
import { jsonrepair } from 'jsonrepair';
import { HomeworkAnalysis } from '../dtos/homework-question.dto';

interface HomeworkOptions {
  imageBase64: string;
  subject?: string;
}

export const SolveHomeworkUseCase = async (
  openai: OpenAI,
  options: HomeworkOptions
): Promise<HomeworkAnalysis> => {
  const { imageBase64, subject } = options;

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: 'Eres un profesor experto. Analiza la imagen y proporciona la solución en formato JSON con la siguiente estructura exacta, sin texto adicional antes o después del JSON: {"solution": "explicación detallada", "steps": ["paso 1", "paso 2"], "answer": "respuesta final", "confidence": 0.95}'
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Resuelve este problema ${subject ? 'de ' + subject : 'académico'} y devuelve la respuesta en JSON.`
          },
          {
            type: "image_url",
            image_url: {
              url: imageBase64
            }
          }
        ]
      }
    ],
    model: "gpt-4o",
    max_tokens: 4096,
    temperature: 0.3 // Reducido para obtener respuestas más consistentes
  });

  try {
    const content = completion.choices[0].message.content || '';
    
    // Si la respuesta no comienza con {, intentamos encontrar el JSON dentro del texto
    let jsonString = content;
    if (!content.trim().startsWith('{')) {
      const matches = content.match(/\{[\s\S]*\}/);
      jsonString = matches ? matches[0] : content;
    }

    // Intentamos reparar y parsear el JSON
    const repairedJson = jsonrepair(jsonString);
    const parsedResponse = JSON.parse(repairedJson);

    // Validamos que la respuesta tenga la estructura correcta
    if (!parsedResponse.solution || !Array.isArray(parsedResponse.steps) || !parsedResponse.answer) {
      // Si falta algún campo, creamos una respuesta estructurada con el contenido original
      return {
        solution: content,
        steps: ["Paso 1: Ver solución completa arriba"],
        answer: "Ver solución detallada",
        confidence: 0.7
      };
    }

    return parsedResponse;
  } catch (error) {
    console.error('Error al procesar la respuesta de OpenAI:', error);
    
    // En caso de error, devolvemos la respuesta en un formato estructurado
    return {
      solution: completion.choices[0].message.content || 'No se pudo procesar la respuesta',
      steps: ["Paso 1: Ver solución completa arriba"],
      answer: "Ver solución detallada",
      confidence: 0.5
    };
  }
};