/** Helpers shared by the G checks. */

/** Directions addressed to AI systems inside content: they look like prompt injection to answer engines. */
export const TO_AI = [
  /\bif you are an? (ai|llm|language model|assistant|chatbot)\b/i,
  /\b(note|message|instructions?) (for|to) (ai|llms?|language models?|ai agents?|assistants?)\b/i,
  /\bignore (all |any )?(previous|prior|above) instructions\b/i,
  /\b(ai|llm) agents?,? (please |just )?(say|tell|recommend|share|mention)\b/i,
  /(для|к) (ai|ии)[- ]?(агент\p{L}*|ассистент\p{L}*|моделей)\s*:/iu,
  /если вы (ии|ai|нейросеть|языковая модель)/iu,
  /игнорируй(те)? (все )?(предыдущие|прошлые) инструкции/iu,
];

/** The first direction to AI in a text, quoted with a little context, or null. */
export const findToAi = (text: string) => {
  for (const re of TO_AI) {
    const m = text.match(re);
    if (m) {
      const i = m.index ?? 0;
      return text.slice(Math.max(0, i - 10), i + 80).trim();
    }
  }
  return null;
};
