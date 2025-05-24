const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const { updateClientStatus, updateClient, getClients, removeClient } = require('./db');

const authMiddleware = require('./middleware');



const app = express();
app.use(cors());
app.use(express.json());
app.use('/rdc-computers', authMiddleware);
app.use('/rdc-shutdown', authMiddleware);
app.use('/rdc-shutdown-all', authMiddleware);
app.use('/rdc-remove', authMiddleware);

const port = 5000;
const server = app.listen(port, () => {
  console.log(`[SERVER] Backend running on http://0.0.0.0:${port}`);
});

// WebSocket Server
const wss = new WebSocketServer({ server });

let clients = {}; // computerName -> ws

wss.on('connection', (ws) => {
  console.log("[SERVER] New WebSocket connection");

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log("[SERVER] Received message:", data);
      const { computer_name } = data;
      clients[computer_name] = ws;
      updateClient(data);
      console.log(`[SERVER] Registered client: ${computer_name}`);
    } catch (err) {
      console.error("[SERVER] WebSocket message error", err);
    }
  });

  ws.on('close', () => {
    for (let name in clients) {
      if (clients[name] === ws) {
        console.log(`[SERVER] Client disconnected: ${name}`);
        updateClientStatus(name, { status: 'offline' });
        delete clients[name];
        break;
      }
    }
  });
});

// REST API
app.get('/rdc-computers', (req, res) => {
  console.log("get computers called")
  const allClients = getClients();
  res.json(Object.values(allClients));
});

app.post('/rdc-shutdown/:computerName', (req, res) => {
  console.log("shutdown called")
  const { computerName } = req.params;
  if (clients[computerName]) {
    clients[computerName].send(JSON.stringify({ type: "shutdown" }));
    res.json({ message: `Shutdown sent to ${computerName}` });
  } else {
    res.status(404).json({ message: "Computer not connected" });
  }
});

app.post('/rdc-shutdown-all', (req, res) => {
  console.log("shutdown-all called")
  for (let name in clients) {
    clients[name].send(JSON.stringify({ type: "shutdown" }));
  }
  res.json({ message: "Shutdown command sent to ALL clients." });
});

app.delete('/rdc-remove/:computerName', (req, res) => {
  console.log("remove called for:", req.params.computerName);
  try {
    const { computerName } = req.params;
    const success = removeClient(computerName);

    if (success) {
      res.status(200).json({ message: `Computer ${computerName} removed successfully` });
    } else {
      res.status(404).json({ error: `Computer ${computerName} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
