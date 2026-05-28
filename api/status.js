// api/status.js
// Polls AssemblyAI for transcript status + handles Hinglish/Hindi conversion via Groq

const https = require('https');

const ASSEMBLYAI_KEY = process.env.ASSEMBLYAI_KEY;
const GROQ_KEY = process.env.GROQ_KEY;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, lang } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing job id' });

  try {
    const result = await getJSON(
      `https://api.assemblyai.com/v2/transcript/${id}`,
      { authorization: ASSEMBLYAI_KEY }
    );

    if (result.status === 'queued' || result.status === 'processing') {
      return res.status(200).json({ status: result.status });
    }

    if (result.status === 'error') {
      return res.status(200).json({ status: 'error', error: result.error || 'Transcription failed' });
    }

    if (result.status === 'completed') {
      const rawText = result.text || '';
      const words = result.words || [];
      const detectedLang = result.language_code || 'en';

      const response = {
        status: 'completed',
        text: rawText,
        words: words,
        detectedLang,
      };

      // Hinglish conversion via Groq
      if (lang === 'hinglish' && GROQ_KEY && rawText) {
        try {
          response.text = await convertToHinglish(rawText);
        } catch (e) {
          console.warn('Hinglish conversion failed:', e.message);
          // fallback: keep raw text
        }
      }

      // Hindi conversion via Groq
      // If AssemblyAI already detected Hindi (hi), text is already in Hindi script
      // Only convert if the source was English/Hinglish
      if (lang === 'hindi' && GROQ_KEY && rawText && !detectedLang.startsWith('hi')) {
        try {
          response.text = await convertToHindi(rawText);
        } catch (e) {
          console.warn('Hindi conversion failed:', e.message);
        }
      }

      return res.status(200).json(response);
    }

    return res.status(200).json({ status: result.status || 'unknown' });

  } catch (err) {
    console.error('Status error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

async function convertToHinglish(text) {
  const prompt = `You are a Hinglish language expert. Convert the following transcript into natural Hinglish — exactly the way Indians type on WhatsApp and Instagram. Rules:
- Write Hindi words in Roman script (not Devanagari)
- Mix Hindi and English naturally, like real Indian conversation
- Keep English technical words, brand names, and proper nouns as-is
- Do NOT translate everything to Hindi — keep the natural mix
- Sound conversational, not like a formal translation
- Output ONLY the converted transcript, nothing else

Transcript:
${text}`;
  return await callGroq(prompt);
}

async function convertToHindi(text) {
  const prompt = `Translate the following transcript into natural, conversational Hindi using Devanagari script. Keep proper nouns, brand names, and technical English terms as-is. Output ONLY the Hindi translation, nothing else.

Transcript:
${text}`;
  return await callGroq(prompt);
}

async function callGroq(prompt) {
  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  };

  const result = await postJSON(
    'https://api.groq.com/openai/v1/chat/completions',
    body,
    { Authorization: `Bearer ${GROQ_KEY}` }
  );

  if (result.choices && result.choices[0] && result.choices[0].message) {
    return result.choices[0].message.content.trim();
  }

  // If Groq rate-limited or errored, log and throw
  const errMsg = result.error ? result.error.message : 'Groq returned no content';
  throw new Error(errMsg);
}

function getJSON(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = { method: 'GET', headers: { 'Content-Type': 'application/json', ...headers } };
    https.request(url, opts, (resp) => {
      let raw = '';
      resp.on('data', d => raw += d);
      resp.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(new Error('Bad JSON from AssemblyAI')); } });
    }).on('error', reject).end();
  });
}

function postJSON(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const req = https.request(url, opts, (resp) => {
      let raw = '';
      resp.on('data', d => raw += d);
      resp.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(new Error('Bad JSON from Groq')); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}
