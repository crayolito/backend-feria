import OpenAI from 'openai';
import { jsonrepair } from 'jsonrepair';

interface Options {
  prompt: string;
}

interface ReforestationAnalysis {
  condicionesActuales: {
    climaFavorable: boolean;
    riesgoIncendio: string;
    condicionesSuelo: string;
    factoresLimitantes: string[];
  };
  especiesRecomendadas: Array<{
    nombre: string;
    razonRecomendacion: string;
    tasaCrecimiento: string;
    requerimientosEspeciales: string[];
  }>;
  epocasPlantacion: {
    optima: string;
    alternativa: string;
    justificacion: string;
  };
  riesgosIdentificados: Array<{
    tipo: string;
    nivelRiesgo: string;
    medidasMitigacion: string[];
  }>;
  recomendacionesManejo: Array<{
    fase: string;
    acciones: string[];
    frecuencia: string;
  }>;
  planMonitoreo: {
    parametros: string[];
    frecuencia: string;
    indicadoresExito: string[];
  };
}

export const ReportPDFUseCase = async (
  openai: OpenAI,
  options: Options
): Promise<ReforestationAnalysis> => {
  const { prompt } = options;

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
        Eres un experto en reforestación y ecología. A partir de los datos proporcionados sobre clima, incendios y características de la zona:

        1. Analiza las condiciones actuales y determina la viabilidad de reforestación
        2. Recomienda especies apropiadas basadas en las condiciones específicas
        3. Identifica los mejores momentos para la plantación
        4. Evalúa riesgos potenciales
        5. Proporciona recomendaciones de manejo
        6. Sugiere un plan de monitoreo

        Consideraciones importantes:
        - Prioriza especies nativas adaptadas a las condiciones locales
        - Considera el clima actual y sus variaciones
        - Ten en cuenta la presencia de incendios y su impacto
        - Evalúa las características del suelo y topografía
        - Considera el uso actual y potencial del terreno
        - Incluye medidas de protección contra incendios
        - Sugiere técnicas de conservación de agua
        - Propón medidas de seguimiento y mantenimiento

        Retorna el análisis en el siguiente formato JSON:
        {
          "condicionesActuales": {
            "climaFavorable": boolean,
            "riesgoIncendio": "bajo|medio|alto",
            "condicionesSuelo": "descripción",
            "factoresLimitantes": ["factor1", "factor2"]
          },
          "especiesRecomendadas": [
            {
              "nombre": "nombre de la especie",
              "razonRecomendacion": "razón de la recomendación",
              "tasaCrecimiento": "lenta|media|rápida",
              "requerimientosEspeciales": ["req1", "req2"]
            }
          ],
          "epocasPlantacion": {
            "optima": "mejor época del año",
            "alternativa": "época alternativa",
            "justificacion": "razón de la selección"
          },
          "riesgosIdentificados": [
            {
              "tipo": "tipo de riesgo",
              "nivelRiesgo": "bajo|medio|alto",
              "medidasMitigacion": ["medida1", "medida2"]
            }
          ],
          "recomendacionesManejo": [
            {
              "fase": "fase del proyecto",
              "acciones": ["acción1", "acción2"],
              "frecuencia": "periodicidad"
            }
          ],
          "planMonitoreo": {
            "parametros": ["parámetro1", "parámetro2"],
            "frecuencia": "periodicidad",
            "indicadoresExito": ["indicador1", "indicador2"]
          }
        }

        El análisis debe ser específico para la zona y condiciones proporcionadas.
        Las recomendaciones deben ser prácticas y realizables.
        Incluye medidas concretas y cuantificables cuando sea posible.
        `
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: "gpt-3.5-turbo",
    temperature: 0.7,
  });

  try {
    const jsonString = completion.choices[0].message.content;
    const repairedJson = jsonrepair(jsonString);
    const parsedResponse = JSON.parse(repairedJson);
    return parsedResponse;
  } catch (error) {
    console.error('Error al procesar la respuesta de OpenAI:', error);
    throw new Error(`Error al procesar la respuesta de OpenAI: ${error.message}`);
  }
};