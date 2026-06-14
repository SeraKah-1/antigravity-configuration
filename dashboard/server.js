const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve brain directory
const HOME = process.env.HOME || '/home/ayintaput';
const BRAIN_DIR = path.join(HOME, '.gemini/antigravity-cli/brain');

// Endpoint to list all sessions
app.get('/api/sessions', (req, res) => {
  try {
    if (!fs.existsSync(BRAIN_DIR)) {
      return res.json([]);
    }
    const dirs = fs.readdirSync(BRAIN_DIR)
      .filter(file => fs.statSync(path.join(BRAIN_DIR, file)).isDirectory() && !file.startsWith('.'))
      .map(dir => {
        const stat = fs.statSync(path.join(BRAIN_DIR, dir));
        return {
          id: dir,
          modifiedAt: stat.mtime
        };
      })
      .sort((a, b) => b.modifiedAt - a.modifiedAt);
    
    res.json(dirs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper function to estimate tokens from characters
const estimateTokens = (text) => Math.round((text || '').length / 4);

// Endpoint to get details of a specific session (or latest if not specified)
app.get('/api/stats', (req, res) => {
  try {
    let convId = req.query.sessionId;
    
    if (!fs.existsSync(BRAIN_DIR)) {
      return res.status(404).json({ error: 'Brain directory not found' });
    }

    if (!convId) {
      // Find the most recently modified conversation directory
      const dirs = fs.readdirSync(BRAIN_DIR)
        .filter(file => fs.statSync(path.join(BRAIN_DIR, file)).isDirectory() && !file.startsWith('.'))
        .map(dir => ({
          id: dir,
          mtime: fs.statSync(path.join(BRAIN_DIR, dir)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);
      
      if (dirs.length === 0) {
        return res.status(404).json({ error: 'No sessions found' });
      }
      convId = dirs[0].id;
    }

    const sessionDir = path.join(BRAIN_DIR, convId);
    const transcriptPath = path.join(sessionDir, '.system_generated/logs/transcript.jsonl');
    const transcriptFullPath = path.join(sessionDir, '.system_generated/logs/transcript_full.jsonl');

    if (!fs.existsSync(transcriptPath)) {
      return res.status(404).json({ error: `Transcript not found for session ${convId}` });
    }

    // Read and parse transcripts
    const compactContent = fs.readFileSync(transcriptPath, 'utf8');
    const compactLines = compactContent.split('\n').filter(line => line.trim() !== '');
    
    let fullBytes = 0;
    if (fs.existsSync(transcriptFullPath)) {
      fullBytes = fs.statSync(transcriptFullPath).size;
    } else {
      fullBytes = fs.statSync(transcriptPath).size;
    }

    const compactBytes = fs.statSync(transcriptPath).size;
    const estTokensCompact = Math.round(compactBytes / 4);
    const estTokensFull = Math.round(fullBytes / 4);

    let totalSteps = 0;
    let userMessages = 0;
    let modelResponses = 0;
    let toolCallsCount = 0;
    const modelsUsedSet = new Set();
    let latestModel = 'unknown';
    
    const timeSeries = [];
    const recentEvents = [];
    
    let firstTs = null;
    let lastTs = null;

    let accumulatedCompactBytes = 0;
    
    // Default model if none detected
    modelsUsedSet.add('Claude Opus 4.6 (Thinking)');
    latestModel = 'Claude Opus 4.6 (Thinking)';

    compactLines.forEach((lineText, index) => {
      accumulatedCompactBytes += Buffer.byteLength(lineText) + 1; // +1 for newline
      try {
        const step = JSON.parse(lineText);
        
        if (step.step_index !== undefined) {
          totalSteps = Math.max(totalSteps, step.step_index + 1);
        }

        if (index === 0 && step.created_at) {
          firstTs = step.created_at;
        }
        if (step.created_at) {
          lastTs = step.created_at;
        }

        if (step.type === 'USER_INPUT') {
          userMessages++;
          
          // Check for model change log inside content
          const content = step.content || '';
          const modelChangeRegex = /from [A-Za-z0-9. ()\-]+ to ([A-Za-z0-9. ()\-]+)\. No need/g;
          let match;
          while ((match = modelChangeRegex.exec(content)) !== null) {
            const newModel = match[1].trim();
            modelsUsedSet.add(newModel);
            latestModel = newModel;
          }
        } else if (step.type === 'PLANNER_RESPONSE') {
          modelResponses++;
        }

        if (step.tool_calls && Array.isArray(step.tool_calls)) {
          toolCallsCount += step.tool_calls.length;
          
          // Log tool calls as events
          step.tool_calls.forEach(tool => {
            recentEvents.push({
              time: step.created_at || new Date().toISOString(),
              type: 'tool',
              name: tool.name || 'unknown',
              summary: tool.toolSummary || tool.toolAction || '',
              step: step.step_index
            });
          });
        }

        // Add to time series for growth chart
        timeSeries.push({
          step: step.step_index || index,
          tokensCompact: Math.round(accumulatedCompactBytes / 4),
          tokensFull: Math.round((accumulatedCompactBytes / compactBytes) * estTokensFull),
          timestamp: step.created_at
        });

      } catch (e) {
        // Skip invalid JSON lines
      }
    });

    // Handle case where we didn't capture timestamps
    if (!firstTs && compactLines.length > 0) {
      try {
        firstTs = JSON.parse(compactLines[0]).created_at;
      } catch (e) {}
    }
    if (!lastTs && compactLines.length > 0) {
      try {
        lastTs = JSON.parse(compactLines[compactLines.length - 1]).created_at;
      } catch (e) {}
    }

    // Health analysis
    let healthLevel = 'LOW';
    let healthMessage = 'Sesi aman dan efisien.';
    let healthAdvice = 'Kepala ruang aman. Lanjutkan kerja Anda.';

    if (estTokensFull > 500000) {
      healthLevel = 'HIGH';
      healthMessage = 'PENGGUNAAN TINGGI — Estimasi transkrip penuh melebihi 500K token.';
      healthAdvice = 'Sangat disarankan untuk memulai sesi baru untuk menghindari pemotongan memori (checkpoint truncation) dan peningkatan latensi.';
    } else if (estTokensFull > 200000) {
      healthLevel = 'MODERATE';
      healthMessage = 'PENGGUNAAN SEDANG — Transkrip penuh mencapai ~' + estTokensFull.toLocaleString() + ' token.';
      healthAdvice = 'Perhatikan batasan rate limit. Sesi masih cukup sehat, namun pertimbangkan untuk merangkum berkas jika sudah terlalu besar.';
    }

    if (totalSteps > 300 && healthLevel === 'LOW') {
      healthLevel = 'MODERATE';
      healthMessage = 'SESI PANJANG — Langkah pengerjaan sudah mencapai ' + totalSteps + ' langkah.';
      healthAdvice = 'Pertimbangkan untuk mengarsipkan status atau memulai sesi baru agar konteks model tetap bersih.';
    }

    // Get last 15 tool events, sorted by time desc
    const sortedEvents = recentEvents
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 15);

    res.json({
      sessionId: convId,
      startedAt: firstTs,
      latestAt: lastTs,
      currentModel: latestModel,
      modelsUsed: Array.from(modelsUsedSet),
      activity: {
        totalSteps,
        userMessages,
        modelResponses,
        toolCalls: toolCallsCount
      },
      tokens: {
        compact: estTokensCompact,
        full: estTokensFull,
        compactBytes,
        fullBytes
      },
      health: {
        level: healthLevel,
        message: healthMessage,
        advice: healthAdvice
      },
      timeSeries: timeSeries.slice(-50), // Send last 50 steps for graph to keep payload size optimal
      recentEvents: sortedEvents
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static dashboard files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Antigravity Token Dashboard running at http://localhost:${PORT}`);
  console.log(`📂 Monitoring session directory: ${BRAIN_DIR}`);
});
