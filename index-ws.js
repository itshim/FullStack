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

process.on("SIGINT", () => {
  console.log("sigint");
  wss.clients.forEach(function each(_client) {
    _client.close();
  });
  server.close(() => {
    shutdownDB();
  });
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

  console.log("INSERT");
  db.run(`INSERT into  visitors (count, time)
    VALUES (${numClients}, datetime('now'))
  `);

  ws.on("close", function () {
    console.log("A Client is disconnected");
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function fn(client) {
    client.send(data);
  });
};

// End of websocket

// Begin database
const sqlite = require("sqlite3");
const db = new sqlite.Database(":memory:");
db.serialize(() => {
  db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
    `);
});

async function getCounts() {
  return new Promise((res, rej) => {
    db.each(`SELECT * FROM visitors`, (err, row) => {
      if (err) rej(err);
      console.log(row);
      res();
    });
  });
}

async function shutdownDB() {
  if (db.OPEN) {
    await getCounts();
    db.close();
    console.log("SHUTTING DOWN DB....");
  }
}
