import express from 'express';
import multer from 'multer';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { PlankaClient } from './planka/client.js';
import { createMcpServer } from './server.js';

const upload = multer({ storage: multer.memoryStorage() });

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const PLANKA_URL = process.env.PLANKA_URL;
const PLANKA_EMAIL = process.env.PLANKA_EMAIL;
const PLANKA_PASSWORD = process.env.PLANKA_PASSWORD;

if (!PLANKA_URL || !PLANKA_EMAIL || !PLANKA_PASSWORD) {
  console.error(
    'Missing required environment variables: PLANKA_URL, PLANKA_EMAIL, PLANKA_PASSWORD'
  );
  process.exit(1);
}

const plankaClient = new PlankaClient(PLANKA_URL, PLANKA_EMAIL, PLANKA_PASSWORD);

// Verify credentials at startup
try {
  await plankaClient.authenticate();
  console.log(`Connected to Planka at ${PLANKA_URL}`);
} catch (err) {
  console.error('Failed to authenticate with Planka:', err);
  process.exit(1);
}

const app = express();
app.use(express.json());

// Map of sessionId -> transport for active sessions
const transports = new Map<string, StreamableHTTPServerTransport>();

app.all('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  // Reuse existing transport for this session
  if (sessionId && transports.has(sessionId)) {
    const transport = transports.get(sessionId)!;
    await transport.handleRequest(req, res, req.body);
    return;
  }

  // New session - only allow POST for initialization
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed for new sessions' });
    return;
  }

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    onsessioninitialized: (newSessionId) => {
      transports.set(newSessionId, transport);
    },
  });

  transport.onclose = () => {
    const sid = transport.sessionId;
    if (sid) {
      transports.delete(sid);
    }
  };

  const server = createMcpServer(plankaClient);
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

// DELETE /mcp - terminate session
app.delete('/mcp', (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (sessionId && transports.has(sessionId)) {
    const transport = transports.get(sessionId)!;
    transport.close();
    transports.delete(sessionId);
    res.status(200).json({ message: 'Session terminated' });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// POST /upload - multipart/form-data file upload forwarded to Planka
// Fields: file (required), cardId (required, form field or query param), filename (optional)
app.post('/upload', upload.single('file'), async (req, res) => {
  const cardId = (req.body.cardId ?? req.query.cardId) as string | undefined;
  if (!cardId) {
    res.status(400).json({ error: 'cardId is required (form field or query param)' });
    return;
  }
  if (!req.file) {
    res.status(400).json({ error: 'file is required' });
    return;
  }
  try {
    const filename = (req.body.filename ?? req.file.originalname) as string;
    const attachment = await plankaClient.uploadAttachmentBuffer(
      cardId,
      req.file.buffer,
      filename,
      req.file.mimetype
    );
    res.json(attachment);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', plankaUrl: PLANKA_URL });
});

app.listen(PORT, () => {
  console.log(`MCP Planka server running on port ${PORT}`);
  console.log(`Connect with: claude mcp add planka --transport http http://localhost:${PORT}/mcp`);
});
