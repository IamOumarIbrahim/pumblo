import express from 'express';
import { db } from '../lib/db/index.js';
import { signUp, login, verifyProofOfHumanity, requireHumanTrustToken } from '../lib/auth/index.js';
import { parseAndVerifyC2PAManifest } from '../lib/provenance/c2pa.js';
import { calculateSQS } from '../lib/quality/sqs.js';
import { runAutomatedCSAMCheck, isConsentApproved } from '../lib/moderation/index.js';

export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limit map
const ipRateLimits = new Map<string, number>();

app.use((req, res, next) => {
  const ip = req.ip || '127.0.0.1';
  const count = (ipRateLimits.get(ip) || 0) + 1;
  ipRateLimits.set(ip, count);
  if (count > 500) {
    return res.status(429).json({ error: 'Edge rate limit exceeded' });
  }
  next();
});

// HTML Pages (SSR / Marketing / Watch / Channel / Studio)
app.get('/', async (req, res) => {
  const videos = await db.queryVideos({ discoveryOnly: true, sort: 'sqs' });
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Pumblo — The YouTube of AI Video</title>
      <meta name="description" content="Every video is AI-generated. Every account is a real, verified human. Every ranking is earned." />
    </head>
    <body>
      <h1>Pumblo</h1>
      <p>Every video AI, every account human, zero bots.</p>
      <div id="discovery-feed">
        ${videos.map(v => `<div class="video-card"><h3>${v.title}</h3><p>SQS: ${v.sqsScore}</p></div>`).join('')}
      </div>
    </body>
    </html>
  `);
});

app.get('/watch/:slug', async (req, res) => {
  const video = await db.getVideoBySlug(req.params.slug);
  if (!video) return res.status(404).send('Video not found');
  const comments = await db.getComments(video.id);

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>${video.title} — Pumblo</title>
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": "${video.title}",
        "description": "AI Video generated with ${video.generationTool}",
        "thumbnailUrl": ["https://www.pumblo.ai/thumbs/${video.id}.jpg"],
        "uploadDate": "${video.createdAt.toISOString()}"
      }
      </script>
    </head>
    <body>
      <h1>${video.title}</h1>
      <div class="provenance-panel">
        <span>Tool: ${video.generationTool}</span>
        <span>Mode: ${video.generationMode}</span>
        <span>C2PA Verified: ${video.c2paVerified}</span>
        <span>License: ${video.license}</span>
      </div>
      <div id="comments">
        ${comments.map(c => `<p>${c.content}</p>`).join('')}
      </div>
    </body>
    </html>
  `);
});

app.get('/channel/:handle', async (req, res) => {
  const user = await db.getUserByHandle(req.params.handle);
  if (!user) return res.status(404).send('Channel not found');
  const userVideos = Array.from(db.videos.values()).filter(v => v.userId === user.id);
  const verifiedCount = userVideos.filter(v => v.c2paVerified).length;
  const consistencyScore = userVideos.length > 0 ? Math.round((verifiedCount / userVideos.length) * 100) : 100;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>${user.handle} — Pumblo Channel</title></head>
    <body>
      <h2>@${user.handle}</h2>
      <p>Human-Verified: ${user.isHumanVerified}</p>
      <p>Consistency Score: ${consistencyScore}%</p>
    </body>
    </html>
  `);
});

// API Routes
app.post('/api/v1/auth/signup', async (req, res) => {
  try {
    const { email, password, handle } = req.body;
    const user = await signUp(email, password, handle);
    res.json({ success: true, user: { id: user.id, email: user.email, handle: user.handle } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, sessionId } = await login(email, password);
    res.cookie('pumblo_session', sessionId, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.json({ success: true, sessionId, userId: user.id });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

app.post('/api/v1/auth/verify', async (req, res) => {
  try {
    const { userId, turnstileToken } = req.body;
    const humanToken = await verifyProofOfHumanity(userId, turnstileToken);
    res.json({ success: true, humanTrustToken: humanToken });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/v1/videos', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const user = await requireHumanTrustToken(authHeader);

    const {
      title,
      generation_tool,
      generation_mode,
      license,
      depicts_real_person,
      prompt_disclosure,
      c2pa_manifest,
      filename,
    } = req.body;

    if (!title || !generation_tool || !generation_mode || !license) {
      return res.status(400).json({ error: 'Missing required upload metadata' });
    }

    const depictsBool = depicts_real_person === true || depicts_real_person === 'true';

    // Automated CSAM Check
    if (runAutomatedCSAMCheck(filename || title)) {
      return res.status(403).json({ error: 'Zero tolerance violation: Prohibited content' });
    }

    // Provenance Verification
    const prov = await parseAndVerifyC2PAManifest(c2pa_manifest, generation_tool, filename);
    if (prov.isCameraFootage) {
      return res.status(400).json({ error: 'Ingest rejection: Camera footage not permitted' });
    }

    // Calculate SQS
    const sqsResult = calculateSQS({
      tfs: 85,
      pcs: prov.pcsScore,
      hes: 75,
      cts: 90,
      fdf: 100,
      mp: 0,
    });

    let status: 'published' | 'moderation_review' = 'published';
    if (prov.requiresReview || depictsBool) {
      status = 'moderation_review';
    }

    const video = await db.createVideo({
      title,
      userId: user.id,
      generationTool: prov.toolDetected,
      generationMode: generation_mode,
      license,
      depictsRealPerson: depictsBool,
      promptDisclosure: prompt_disclosure,
      c2paVerified: prov.c2paVerified,
      pcsScore: prov.pcsScore,
      sqsScore: sqsResult.sqs,
      videoUrl: `https://cdn.pumblo.ai/videos/${Date.now()}.mp4`,
      status,
      hasSevereFlag: false,
    });

    res.status(201).json({
      success: true,
      video: {
        id: video.id,
        slug: video.slug,
        title: video.title,
        sqsScore: video.sqsScore,
        c2paVerified: video.c2paVerified,
        status: video.status,
      },
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/api/v1/videos/:id', async (req, res) => {
  const video = await db.getVideoById(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found' });
  res.json({ success: true, video });
});

app.post('/api/v1/videos/:id/comments', async (req, res) => {
  try {
    const user = await requireHumanTrustToken(req.headers.authorization);
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Comment content required' });

    const comment = await db.addComment(req.params.id, user.id, content);
    res.status(201).json({ success: true, comment });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/api/v1/channels/:handle', async (req, res) => {
  const user = await db.getUserByHandle(req.params.handle);
  if (!user) return res.status(404).json({ error: 'Channel not found' });
  const videos = Array.from(db.videos.values()).filter(v => v.userId === user.id);
  res.json({
    success: true,
    channel: {
      handle: user.handle,
      isHumanVerified: user.isHumanVerified,
      uploadCount: videos.length,
    },
  });
});

app.get('/api/v1/search', async (req, res) => {
  const tool = req.query.tool as string;
  const mode = req.query.mode as string;
  const license = req.query.license as string;

  const results = await db.queryVideos({ tool, mode, license, discoveryOnly: true });
  res.json({ success: true, count: results.length, videos: results });
});

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Pumblo app running on http://localhost:${port}`));
}
