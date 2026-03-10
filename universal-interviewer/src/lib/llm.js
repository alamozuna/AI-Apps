import { GoogleGenerativeAI } from '@google/generative-ai';

// Hardcoded API Key per user request
const API_KEY = "AIzaSyCM2vv6rTzCl0aSIXJOu1kKr-O8FvLFSiA";

export async function generateInterviewQuestions(cvText, jobDescription, companyInfo) {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Actúa como un reclutador experto y coach de entrevistas.
      Necesito que generes de 20 a 30 posibles preguntas de entrevista altamente personalizadas.
      
      CONTEXTO:
      ---------------------
      Currículum del Candidato:
      ${cvText}
      
      Descripción de la Vacante:
      ${jobDescription}
      
      Misión, Valores y Cultura de la empresa:
      ${companyInfo || "No proporcionado"}
      ---------------------
      
      INSTRUCCIONES:
      Genera exactamente 25 preguntas de entrevista. Las preguntas deben estar basadas específicamente en las habilidades mencionadas en el CV frente a lo que pide la vacante. También deben considerar la cultura de la empresa (si fue proporcionada).
      Para cada pregunta, redacta una "Respuesta sugerida" estructurada (tipo método STAR u otra estrategia) basada en la experiencia real que viene en el CV del candidato.

      FORMATO DE SALIDA (Debes devolver ÚNICAMENTE un JSON válido, sin delimitadores de código markdown \`\`\`json, solo el JSON puro):
      [
        {
          "question": "Pregunta de ejemplo...",
          "answer": "Respuesta estructurada a partir del CV..."
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Attempt to parse JSON. We'll strip potential accidental markdown tags since LLMs use them often.
    const cleanJSON = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanJSON);
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}
