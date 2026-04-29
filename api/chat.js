// Vercel Serverless Function — Chat API
// Reads GEMINI_API_KEY from environment, proxies requests to Gemini 2.0 Flash.

import { PERSONA_DATA } from '../src/prompts.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured. Please set GEMINI_API_KEY.' });
  }

  try {
    const { persona, messages } = req.body;

    if (!persona || !PERSONA_DATA[persona]) {
      return res.status(400).json({ error: 'Invalid persona. Use: anshuman, abhimanyu, or kshitij.' });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const systemPrompt = PERSONA_DATA[persona].systemPrompt;

    // Build Gemini API request
    // Map conversation messages to Gemini format
    const contents = messages
      .filter(m => !m.error)
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

    // Try models in order: primary, then fallback
    const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite'];
    const requestBody = JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.8,
        topP: 0.9,
        maxOutputTokens: 1024
      }
    });

    let lastError = '';
    let data = null;

    for (const model of models) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      console.log(`Trying model: ${model}...`);

      try {
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody
        });

        if (geminiResponse.ok) {
          data = await geminiResponse.json();
          console.log(`✅ Success with model: ${model}`);
          break;
        } else {
          const errBody = await geminiResponse.text();
          console.warn(`⚠️ Model ${model} returned ${geminiResponse.status}:`, errBody.substring(0, 200));
          lastError = errBody;
        }
      } catch (fetchErr) {
        console.warn(`⚠️ Model ${model} fetch error:`, fetchErr.message);
        lastError = fetchErr.message;
      }
    }

    if (!data) {
      console.error('All models failed. Last error:', lastError.substring(0, 300));
      return res.status(502).json({ error: 'AI service is temporarily unavailable. Please try again in a moment.' });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(502).json({ error: 'Received empty response from AI.' });
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}
