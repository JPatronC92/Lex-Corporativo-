import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { ChatMessage, AnalyzedDocumentHistory, LegalDomain } from "../types";

const getDomainConfig = (domain: LegalDomain) => {
  switch (domain) {
    case 'mercantil':
      return {
        name: "LexMercantil",
        expertise: "Derecho Mercantil, Corporativo y Transaccional",
        focus: "LGSM, Código de Comercio, LGTOC, gobierno corporativo, asambleas, fusiones y contratos complejos.",
        pillars: {
          societario: "Análisis de estructura, asambleas y gobierno corporativo",
          contractual: "Análisis de obligaciones, exclusividad y contingencias civiles/mercantiles",
          operativo: "Impacto en la operación diaria y títulos de crédito"
        }
      };
    case 'fiscal':
      return {
        name: "LexiFiscal",
        expertise: "Derecho Fiscal, Defensa Tributaria y Planeación Patrimonial",
        focus: "CFF, ISR, IVA, defensa ante el SAT, materialidad de operaciones, precios de transferencia y auditorías fiscales.",
        pillars: {
          cumplimiento: "Análisis de pago de impuestos y obligaciones formales",
          materialidad: "Verificación de sustancia económica de las operaciones",
          defensa: "Contingencias determinantes y estrategias de impugnación (Recurso/Nulidad)"
        }
      };
    case 'comercio':
      return {
        name: "LexiComercio",
        expertise: "Derecho Aduanero, Comercio Exterior y Tratados Internacionales",
        focus: "Ley Aduanera, T-MEC, Incoterms, pedimentos, NOMs, reglas de carácter general y programas de fomento (IMMEX).",
        pillars: {
          arancelario: "Clasificación, valoración y pago de aranceles/DTA",
          logistico: "Análisis de Incoterms y responsabilidades en tránsito",
          regulativo: "Cumplimiento de NOMs, RRNAs y permisos aduaneros"
        }
      };
  }
};

const getSystemInstruction = (domain: LegalDomain) => {
  const config = getDomainConfig(domain);
  return `
Eres "${config.name}", un motor de inteligencia jurídica de alto nivel en México especializado en ${config.expertise}.

ENFOQUE PRIORITARIO:
${config.focus}

REGLAS DE OPERACIÓN:
- SOBRIEDAD Y PRECISIÓN: Tu tono es estrictamente profesional, técnico y directo.
- SÍNTESIS ESTRATÉGICA: Sintetiza tus respuestas. Evita preámbulos innecesarios. Ve directo al punto legal. Utiliza estructuras jerárquicas (viñetas, negritas) para facilitar la lectura rápida.
- FUNDAMENTACIÓN POSITIVA: Sustenta cada diagnóstico exclusivamente en fuentes del Derecho Positivo Mexicano vigente y Jurisprudencia firme de la SCJN/TFJA.
- ESTRUCTURA: Genera respuestas con organización clara y jerárquica.

No uses lenguaje coloquial. Tu objetivo es la excelencia técnica y la seguridad jurídica para despachos y empresas transnacionales.
`;
};

const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  return new GoogleGenAI({ apiKey });
};

export const streamLegalChat = async (
  history: ChatMessage[],
  newMessage: string,
  useThinking: boolean,
  domain: LegalDomain = 'mercantil',
  analysisHistory: AnalyzedDocumentHistory[] = []
) => {
  const ai = getAIClient();
  const model = 'gemini-2.0-pro-exp-02-05';

  let specializedInstruction = getSystemInstruction(domain);
  
  if (analysisHistory.length > 0) {
    specializedInstruction += "\n\nCONTEXTO DE AUDITORÍAS RECIENTES EN ESTA SESIÓN:";
    analysisHistory.slice(0, 3).forEach((analysis, idx) => {
      specializedInstruction += `\nAuditoría ${idx + 1} (${analysis.timestamp.toLocaleDateString()}):
      - Resumen: ${analysis.result.summary}
      - Riesgo: ${analysis.result.riskScore}/10
      - Hallazgos: ${analysis.result.risks.join(', ')}`;
    });
    specializedInstruction += "\nUtiliza este contexto si el usuario hace referencia a documentos analizados previamente.";
  }

  const config: any = {
    systemInstruction: specializedInstruction,
    tools: [{ googleSearch: {} }], 
  };

  if (useThinking) {
    config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH }; 
  }

  const formattedHistory: any[] = [];
  for (const msg of history) {
    const parts: any[] = [];
    if (msg.text) parts.push({ text: msg.text });

    const lastEntry = formattedHistory[formattedHistory.length - 1];
    if (lastEntry && lastEntry.role === msg.role) {
        lastEntry.parts.push(...parts);
    } else {
        formattedHistory.push({ role: msg.role, parts: parts });
    }
  }

  const chat = ai.chats.create({ model, config, history: formattedHistory });
  return await chat.sendMessageStream({ message: newMessage });
};

export const analyzeLegalDocument = async (
  files: { base64: string; mimeType: string; name: string }[],
  prompt: string,
  domain: LegalDomain = 'mercantil'
) => {
  const ai = getAIClient();
  const config = getDomainConfig(domain);
  const pillarKeys = Object.keys(config.pillars);

  const parts: any[] = files.map(file => ({
    inlineData: { mimeType: file.mimeType, data: file.base64 }
  }));

  parts.push({
    text: `Realice un Dictamen de Auditoría Integral exhaustivo sobre los siguientes instrumentos: ${files.map(f => f.name).join(', ')}.
    Petición técnica de enfoque: ${prompt}`
  });

  const propertiesPillars: Record<string, any> = {};
  pillarKeys.forEach(key => {
    propertiesPillars[key] = { type: Type.STRING, description: (config.pillars as any)[key] };
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-pro-exp-02-05',
    contents: { parts: parts },
    config: {
      systemInstruction: getSystemInstruction(domain),
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          riskScore: { type: Type.NUMBER },
          pillars: {
            type: Type.OBJECT,
            properties: propertiesPillars,
            required: pillarKeys
          },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendation: { type: Type.STRING }
        },
        required: ["summary", "riskScore", "pillars", "risks", "recommendation"]
      }
    }
  });

  return response.text;
};

export const draftLegalDocument = async (requirements: string, domain: LegalDomain = 'mercantil') => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-pro-exp-02-05',
    contents: requirements,
    config: {
      systemInstruction: `${getSystemInstruction(domain)}\n\nTAREA: Proyecte el instrumento jurídico formal completo siguiendo la técnica legislativa mexicana.`,
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } 
    }
  });
  return response.text;
};
