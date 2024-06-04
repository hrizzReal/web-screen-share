const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const url = require('url');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sessions = {}; // Object to hold session data

// Serve static files
app.use(express.static('public'));

// Broadcast incoming WebSocket messages to clients in the same session
wss.on('connection', (ws, req) => {
  const parameters = url.parse(req.url, true);
  const sessionId = parameters.query.sessionId;

  console.log(`New connection in session: ${sessionId}`);

  if (!sessions[sessionId]) {
    sessions[sessionId] = [];
  }

  sessions[sessionId].push(ws);

  ws.on('message', (message) => {
    console.log(`Message received in session: ${sessionId}`);
    sessions[sessionId].forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    sessions[sessionId] = sessions[sessionId].filter(client => client !== ws);
    console.log(`Connection closed in session: ${sessionId}`);
  });
});

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
