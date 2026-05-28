// api/transcribe.js
// Vercel Serverless Function — receives video URL, starts AssemblyAI job

const https = require('https');
const ASSEMBLYAI_KEY = process.env.ASSEMBLYAI_KEY;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url, lang } = req.body;
  if (!url) return res.status(400).json({ error: 'No URL provided' });
  if (!ASSEMBLYAI_KEY) return res.status(500).json({ error: 'Server misconfigured: missing ASSEMBLYAI_KEY' });

  try {
    const ytdlp = require('yt-dlp-exec');

    let audioUrl;
    try {
      const info = await ytdlp(url, {
        noPlaylist: true,
        format: 'bestaudio[ext=m4a]/bestaudio/best',
        getUrl: true,
        noWarnings: true,
      });
      audioUrl = typeof info === 'string' ? info.trim().split('\n')[0] : null;
    } catch (e) {
      try {
        const info2 = await ytdlp(url, { noPlaylist: true, getUrl: true, noWarnings: true });
        audioUrl = typeof info2 === 'string' ? info2.trim().split('\n')[0] : null;
      } catch {
        throw new Error('Could not access this video. Make sure it is a public YouTube Short, Instagram Reel, or TikTok video.');
      }
    }

    if (!audioUrl || !audioUrl.startsWith('http')) {
      throw new Error('Could not extract audio from this link. Please check the link and try again.');
    }

    const transcriptPayload = {
      audio_url: audioUrl,
      punctuate: true,
      format_text: true,
    };

    if (lang === 'english') {
      transcriptPayload.language_code = 'en';
    } else {
      transcriptPayload.language_detection = true;
    }

    const aaiResp = await postJSON(
      'https://api.assemblyai.com/v2/transcript',
      transcriptPayload,
      { authorization: ASSEMBLYAI_KEY }
    );

    if (!aaiResp.id) throw new Error('AssemblyAI did not return a job ID. Check your API key.');

    return res.status(200).json({ jobId: aaiResp.id, lang, status: 'queued' });

  } catch (err) {
    console.error('Transcribe error:', err.message);
    return res.status(500).json({ error: err.message || 'Transcription failed.' });
  }
};

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
      resp.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(new Error('Bad response from AssemblyAI')); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}
