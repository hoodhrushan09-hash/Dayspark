import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  // Set CORS headers for Vercel Serverless Function
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userPrompt, startTime, endTime, date } = req.body || {};
  if (!userPrompt || typeof userPrompt !== 'string') {
    return res.status(400).json({ error: 'userPrompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      message: 'GEMINI_API_KEY is not configured in environment variables. Switching to smart manual planner.',
      isManualFallback: true,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `You are the DaySpark AI Personal Planning Assistant.
Turn this user's natural language list of responsibilities and constraints into a realistic, conflict-free daily schedule.

User Description: "${userPrompt.slice(0, 3000)}"
Target Date: ${date || 'Today'}
Working Hours Window: ${startTime || '09:00'} to ${endTime || '17:00'}

Requirements:
1. Sequence items logically (urgent/complex deep-work early, lighter tasks later).
2. Assign realistic durations between 15 and 120 minutes.
3. Compute exact startTime and endTime strings (HH:mm format, e.g. "09:00", "09:45").
4. Assign priority ('urgent', 'high', 'medium', 'low') and explain scheduling reasoning.
5. Identify any unrealistic workloads or schedule overflows in 'conflictWarnings'.
6. Write a concise, supportive 1-2 sentence plan summary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planSummary: { type: Type.STRING },
            conflictWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            scheduledBlocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  priority: { type: Type.STRING, enum: ['low', 'medium', 'high', 'urgent'] },
                  category: { type: Type.STRING },
                  isUrgent: { type: Type.BOOLEAN },
                  reasoning: { type: Type.STRING },
                },
                required: ['title', 'startTime', 'endTime', 'durationMinutes', 'priority', 'category'],
              },
            },
          },
          required: ['planSummary', 'scheduledBlocks'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('Gemini planning generation failed:', error);
    return res.status(500).json({
      message: error.message || 'Error communicating with AI service.',
      isManualFallback: true,
    });
  }
}
