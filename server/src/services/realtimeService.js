/**
 * Real-Time Server-Sent Events (SSE) & Notification Service
 * Broadcasts instant updates to connected Admin and Volunteer clients
 * when a Pilgrim reports an issue or an official updates infrastructure status.
 */

const sseClients = new Set();

/**
 * Registers a new SSE client connection
 */
export const registerSSEClient = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': req.headers.origin || '*'
  });

  // Flush headers
  res.flushHeaders?.();

  // Send initial handshake
  const handshake = {
    type: 'CONNECTED',
    message: 'Godavari GeoSeva 2027 Real-Time Event Stream Connected',
    timestamp: new Date().toISOString()
  };
  res.write(`data: ${JSON.stringify(handshake)}\n\n`);

  sseClients.add(res);
  console.log(`[Realtime SSE] Client connected. Total active subscribers: ${sseClients.size}`);

  // Keep-alive heartbeat every 20 seconds
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(`: heartbeat\n\n`);
    } catch {
      clearInterval(heartbeatInterval);
      sseClients.delete(res);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeatInterval);
    sseClients.delete(res);
    console.log(`[Realtime SSE] Client disconnected. Total active subscribers: ${sseClients.size}`);
  });
};

/**
 * Broadcasts an event payload to all connected clients
 */
export const broadcastRealtimeEvent = (event) => {
  const payload = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString()
  };

  const message = `data: ${JSON.stringify(payload)}\n\n`;
  let successCount = 0;

  for (const client of sseClients) {
    try {
      client.write(message);
      successCount++;
    } catch (err) {
      console.warn('[Realtime SSE] Failed to write to client, removing stale connection');
      sseClients.delete(client);
    }
  }

  console.log(
    `[Realtime SSE] Broadcasted [${payload.type}] to ${successCount} active client(s).`
  );
};

