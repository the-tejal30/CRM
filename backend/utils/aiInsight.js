/**
 * AI Insight Engine
 * Uses OpenAI if API key is provided, otherwise returns deterministic mock logic.
 */

const generateMockInsight = (notes, dealValue) => {
  const noteLength = notes ? notes.length : 0;
  const value = parseFloat(dealValue) || 0;

  // Score based on deal value tiers and note richness
  let score = 30;
  if (value > 50000) score += 30;
  else if (value > 10000) score += 20;
  else if (value > 1000) score += 10;

  if (noteLength > 200) score += 20;
  else if (noteLength > 100) score += 15;
  else if (noteLength > 50) score += 10;
  else if (noteLength > 0) score += 5;

  // Clamp between 10 and 95
  score = Math.min(95, Math.max(10, score));

  const probability = Math.round(score * 0.85);

  const actions = [
    'Schedule a product demo this week',
    'Send a personalized follow-up email with case studies',
    'Arrange a call with decision makers',
    'Provide a detailed pricing proposal',
    'Share a free trial or proof-of-concept',
    'Address objections raised in previous notes',
    'Escalate to senior sales rep for enterprise deal',
  ];

  const action = actions[Math.floor(score / 15) % actions.length];

  return {
    leadScore: score,
    suggestedNextAction: action,
    probabilityOfClosing: `${probability}%`,
    analysis: `Based on a deal value of $${value.toLocaleString()} and ${noteLength} characters of notes, this lead shows ${score >= 70 ? 'strong' : score >= 50 ? 'moderate' : 'early-stage'} potential.`,
  };
};

const generateAIInsight = async (notes, dealValue) => {
  if (process.env.OPENAI_API_KEY) {
    try {
      // Dynamic import to avoid hard dependency
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `You are a CRM sales AI assistant. Analyze the following lead data and provide insights.

Deal Value: $${dealValue}
Notes: ${notes || 'No notes provided'}

Respond in valid JSON with exactly these fields:
{
  "leadScore": <integer 0-100>,
  "suggestedNextAction": "<one concise sentence>",
  "probabilityOfClosing": "<percentage string like '72%'>",
  "analysis": "<2-3 sentence analysis>"
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (err) {
      console.warn('OpenAI call failed, falling back to mock:', err.message);
      return generateMockInsight(notes, dealValue);
    }
  }

  return generateMockInsight(notes, dealValue);
};

module.exports = { generateAIInsight };
