# 🎬 ReelScript — Free Shorts & Reels Transcriber

Transcribe YouTube Shorts, Instagram Reels, TikTok videos into English, Hindi, or Hinglish.
No signup required for users. Fully free to host.

---

## ✅ What You Need (All Free)

| Service | What for | Cost |
|---------|----------|------|
| [AssemblyAI](https://assemblyai.com) | Speech-to-text | Free — 100 hrs/month |
| [Groq (console.groq.com) | Hinglish/Hindi conversion | Free — no hard daily cap |
| [Vercel](https://vercel.com) | Hosting + free domain | Free forever |
| [GitHub](https://github.com) | Store code | Free |

---

## 🚀 Step-by-Step Deployment

### Step 1 — Get your API Keys

**AssemblyAI (for transcription):**
1. Go to https://www.assemblyai.com
2. Click "Get a free API key"
3. Sign up (email only, no credit card)
4. Copy your API key from the dashboard

**Groq (for Hinglish/Hindi conversion):**
1. Go to https://console.groq.com
2. Sign up (email only, no credit card)
3. Click "API Keys" in the left sidebar → "Create API Key"
4. Copy the key

---

### Step 2 — Put the code on GitHub

1. Go to https://github.com and create a free account (if you don't have one)
2. Click the **+** button → "New repository"
3. Name it: `reelscript` (or anything you like)
4. Set it to **Public**
5. Click "Create repository"

**Upload the files:**
- Click "uploading an existing file"
- Upload all files from this folder:
  - `public/index.html`
  - `api/transcribe.js`
  - `api/status.js`
  - `vercel.json`
  - `package.json`
- Keep the folder structure (create `public/` and `api/` folders on GitHub)
- Click "Commit changes"

> **Tip:** The easiest way is to drag-and-drop the entire project folder into GitHub's upload page.

---

### Step 3 — Deploy on Vercel (free domain included)

1. Go to https://vercel.com
2. Click "Sign up" → choose "Continue with GitHub"
3. Once logged in, click **"Add New Project"**
4. Select your `reelscript` repository
5. Click **"Deploy"** (leave all settings as default)

Vercel will deploy your site in ~1 minute and give you a free URL like:
`https://reelscript.vercel.app` ✅

---

### Step 4 — Add your API Keys to Vercel

This is the important step — your keys stay secret on the server.

1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Add these two variables:

| Name | Value |
|------|-------|
| `ASSEMBLYAI_KEY` | Your AssemblyAI API key |
| `GROQ_KEY` | Your Google Gemini API key |

3. Click "Save"
4. Go to **Deployments** → click the three dots on your latest deployment → **"Redeploy"**

Your tool is now live! 🎉

---

## 🌍 Your Free Domain

Vercel gives you: `https://YOUR-PROJECT-NAME.vercel.app`

You can share this link directly. Users just open it and start transcribing — no signup, no API keys needed from them.

**Want a custom domain later?**
- Namecheap.com or Porkbun.com sell `.com` domains for ~$10/year
- In Vercel → Settings → Domains → add your domain → follow DNS instructions

---

## 📋 How the Tool Works

```
User pastes video link
        ↓
Vercel backend fetches audio URL via yt-dlp
        ↓
Sends audio URL to AssemblyAI (speech-to-text)
        ↓
Frontend polls every 3 seconds for completion
        ↓
If Hinglish/Hindi selected → Gemini Flash converts the text
        ↓
Transcript shown with Copy + Timestamp toggle
```

---

## 🔧 Supported Platforms

| Platform | Status |
|----------|--------|
| YouTube Shorts | ✅ Works |
| Instagram Reels | ✅ Works (public only) |
| TikTok | ✅ Works (public only) |
| Facebook Reels | ✅ Works |
| YouTube regular videos | ✅ Works |

---

## ⚡ Free Tier Limits

- **AssemblyAI:** 100 hours of audio per month. A 60-second Short = 1 minute used.
- **Gemini Flash:** 1,500 Hinglish/Hindi conversions per day.
- **Vercel:** 100GB bandwidth, 100 serverless function invocations per day on free tier.

For a personal tool or small community, these limits are more than enough.

---

## ❓ Troubleshooting

**"Could not access this video"**
→ Make sure the video is public (not private/restricted)
→ Instagram Reels need to be on a public account

**"Server misconfigured"**
→ Your environment variables are not set. Repeat Step 4.

**Hinglish/Hindi not working but English works**
→ Check your GROQ_KEY is set correctly in Vercel environment variables

**Vercel function timeout**
→ Long videos (>5 min) may timeout. This tool is designed for Shorts (under 3 min).
