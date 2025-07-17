const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

const indexFile = fs.readFileSync(
  path.resolve(path.join(process.cwd(), "./src/ws-server/index.html"))
);

const server = http.createServer(handleRequest);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    // Broadcast message to all connected clients
    // wss.clients.forEach((client) => {
    //   if (client !== ws && client.readyState === WebSocket.OPEN) {
    //     client.send(message);
    //   }
    // });
    while (ws.readyState !== WebSocket.OPEN) {
      console.log("WebSocket is not open, waiting...");
      // Wait for the WebSocket to be open
    }
    updateClient(ws);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

let winCount = 0;
let loseCount = 0;
let totalWins = 0;
let totalLosses = 0;

function updateClient(client, req) {
  let command = "new_connection";
  if (req) {
    command =
      req.url === "/win" ? "win" : req.url === "/reset" ? "reset" : "lose";

    if (command === "win") {
      winCount++;
      loseCount = 0;
      totalWins++;
    } else if (command === "lose") {
      loseCount++;
      winCount = 0;
      totalLosses++;
    } else {
      // Reset counts
      winCount = 0;
      loseCount = 0;
      totalWins = 0;
      totalLosses = 0;
    }
  }

  client.send(
    `{"command": "update", "type": "${command}", "win": ${winCount}, "lose": ${loseCount}, "totalWins": ${totalWins}, "totalLosses": ${totalLosses}}`
  );
}

function handleRequest(req, res) {
  console.log(`Received request for: ${req.url}`);

  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(Buffer.from(indexFile));
    res.end();
    return;
  }

  if (req.url === "/win" || req.url === "/lose" || req.url === "/reset") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end();

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        updateClient(client, req);
      }
    });

    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Page not found\n");
}

server.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
