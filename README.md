# ⚖️ LexCorporativo | Suite Multi-Dominio LegalTech

LexCorporativo es una plataforma de inteligencia jurídica de alto nivel diseñada específicamente para el entorno legal mexicano. Impulsada por inteligencia artificial, el sistema opera con una arquitectura *Multi-Tenant* que le permite funcionar como tres sistemas expertos independientes bajo una sola interfaz.

## 🏛️ Módulos de Especialidad

El sistema adapta su "cerebro" (System Instructions, parámetros de análisis y plantillas) en tiempo real según el módulo seleccionado:

1. 🏢 **LexMercantil:** Especializado en LGSM, Código de Comercio, gobierno corporativo, asambleas, fusiones y contratos mercantiles complejos.
2. 💰 **LexiFiscal:** Enfocado en la defensa tributaria (CFF, ISR, IVA), análisis de materialidad, atención a requerimientos y litigio ante el SAT/TFJA.
3. 🌐 **LexiComercio:** Dominio en Ley Aduanera, T-MEC, Incoterms 2020, pedimentos, NOMs y Reglas de Carácter General en Comercio Exterior.

## ✨ Capacidades Principales (Core Features)

*   💬 **Asesoría Técnica Experta:** Chat contextual segmentado por módulo. Utiliza razonamiento profundo (`ThinkingLevel.HIGH`) y búsqueda web en tiempo real (Grounding) para fundamentar sus respuestas en la legislación mexicana vigente y jurisprudencia de la SCJN.
*   📄 **Auditoría Documental Integral:** Motor capaz de analizar expedientes enteros (PDFs o imágenes) y generar un dictamen técnico con un puntaje de riesgo, cruzando hallazgos entre pilares dinámicos (Ej. en Fiscal: Cumplimiento, Materialidad y Defensa).
*   ✍️ **Ingeniería Jurídica:** Generador automatizado de instrumentos legales. Ofrece plantillas preconfiguradas que cambian según el dominio activo (desde un NDA hasta un Recurso de Revocación o un Contrato de Transporte Internacional).

## 🛠️ Stack Tecnológico

*   **Frontend:** React 19, TypeScript, Vite
*   **Estilos & UI:** Tailwind CSS v4, Lucide React, Motion (Animaciones)
*   **Motor de IA:** Google Gen AI SDK (`@google/genai`) utilizando el modelo `gemini-2.0-pro-exp-02-05`
*   **Persistencia:** Gestión de estado global con elevación en `App.tsx` para mantener el contexto al navegar entre módulos.

*Construido para la excelencia técnica, la seguridad jurídica y la optimización del ejercicio profesional en México.*
