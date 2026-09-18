import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { ScientistEngine } from './server/scientistEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const engine = new ScientistEngine();

  // API Routes FIRST
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Darukaa.Earth AI Environmental Scientist', timestamp: new Date().toISOString() });
  });

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Darukaa.Earth Biodiversity Intelligence Engine',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Chat endpoint (multi-turn conversation with memory)
  app.post('/api/chat', async (req, res) => {
    try {
      const { session_id = 'default_session', message, structured_data } = req.body;
      const result = await engine.processTurn(session_id, message, structured_data);
      res.json(result);
    } catch (err: any) {
      console.error('Error processing /api/chat:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // Structured input endpoint
  app.post('/api/structured-input', async (req, res) => {
    try {
      const sessionId = (req.query.session_id as string) || req.body.session_id || 'structured_session';
      const result = await engine.processTurn(sessionId, undefined, req.body);
      res.json(result);
    } catch (err: any) {
      console.error('Error processing /api/structured-input:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // Internal debug retrieval endpoint for hackathon evaluators
  app.post('/debug/retrieve', (req, res) => {
    try {
      const { query = '', structured_metrics = {}, top_k = 4 } = req.body;
      const chunks = engine.searchKnowledgeChunks(query, top_k);
      const thresholds = engine.lookupStructuredThresholds(structured_metrics);
      const causal = engine.evaluateCausalSystem(structured_metrics);

      let inferredClimate = null;
      if (structured_metrics.lat !== undefined && structured_metrics.lon !== undefined) {
        inferredClimate = engine.inferClimateFromCoords(structured_metrics.lat, structured_metrics.lon);
      }

      res.json({
        query,
        inferred_climate: inferredClimate,
        matched_thresholds: thresholds,
        retrieved_knowledge_chunks: chunks,
        causal_variables_activated: causal.variablesTraced
      });
    } catch (err: any) {
      console.error('Error processing /debug/retrieve:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Session state inspection
  app.get('/api/sessions', (req, res) => {
    res.json(engine.listSessions());
  });

  app.get('/api/sessions/:sessionId', (req, res) => {
    const session = engine.getSession(req.params.sessionId);
    res.json(session);
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Darukaa.Earth AI Environmental Scientist running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
