// Local development API server
// Run with: node dev-server.js
// This simulates the Vercel serverless function locally.

import http from 'http';
import { readFileSync } from 'fs';
import { PERSONA_DATA } from './src/prompts.js';

// Load .env file manually
try {
  const envContent = readFileSync('.env', 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      process.env[key.trim()] = vals.join('=').trim();
    }
  });
} catch (e) {
  console.warn('No .env file found. Set GEMINI_API_KEY environment variable.');
}

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  if (req.url !== '/api/chat' || req.method !== 'POST') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Not found' }));
  }

  // Parse body
  let body = '';
  for await (const chunk of req) body += chunk;

  try {
    const { persona, messages } = JSON.parse(body);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'GEMINI_API_KEY not set. Copy .env.example to .env and add your key.' }));
    }

    if (!persona || !PERSONA_DATA[persona]) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid persona.' }));
    }

    const systemPrompt = PERSONA_DATA[persona].systemPrompt;
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
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody
        });

        if (geminiRes.ok) {
          data = await geminiRes.json();
          console.log(`✅ Success with model: ${model}`);
          break;
        } else {
          const errText = await geminiRes.text();
          console.warn(`⚠️ Model ${model} returned ${geminiRes.status}:`, errText.substring(0, 200));
          lastError = errText;
        }
      } catch (fetchErr) {
        console.warn(`⚠️ Model ${model} fetch error:`, fetchErr.message);
        lastError = fetchErr.message;
      }
    }

    if (!data) {
      console.error('All models failed. Last error:', lastError.substring(0, 300));
      res.writeHead(502, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'AI service is temporarily unavailable. Please try again in a moment.' }));
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Empty AI response.' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ reply }));

  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Internal server error.' }));
  }
});

server.listen(PORT, () => {
  console.log(`\n  🚀 API server running at http://localhost:${PORT}`);
  console.log(`  📡 Endpoint: POST http://localhost:${PORT}/api/chat\n`);
});
