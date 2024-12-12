const express = require("express");
const server = require("http").createServer();

const app = express();

app.get("/", function (req, res) {
  res.sendFile("index.html", { root: __dirname });
});

server.on("request", app);

server.listen(3000, function () {
  console.log("Server started on PORT 3000");
});

/** Web Sockets */
const WebSocketServer = require("ws").Server;

const wss = new WebSocketServer({ server });
wss.on("connection", function connection(ws) {
  const numClients = wss.clients.size;
  console.log("Clients connected", numClients);

  wss.broadcast(`Current visitors ${numClients}`);

  if (ws.readyState === ws.OPEN) {
    ws.send("Welcome to my server");
  }

  ws.on("close", function () {
    console.log("A Client is disconnected");
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function fn(client) {
    client.send(data);
  });
};