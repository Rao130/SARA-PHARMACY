// services/realtime.js
// Simple WebSocket broadcast service
let wss = null;

export const setWSS = (serverInstance) => {
  wss = serverInstance;
};

export const broadcast = (type, payload) => {
  if (!wss) return;
  const msg = JSON.stringify({ type, payload, ts: Date.now() });
  wss.clients.forEach((client) => {
    try {
      if (client.readyState === 1) {
        client.send(msg);
      }
    } catch (_) {}
  });
};
