import http from "node:http";
import fsAsync from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import mime from "mime";

export default function ({ publicDir }) {
  const callbacks = {};

  const server = http.createServer(async (req, res) => {
    if (req.url === "/win") {
      callbacks.onWin && callbacks.onWin();
      res.end("Win recorded");
    } else if (req.url === "/lose") {
      callbacks.onLose && callbacks.onLose();
      res.end("Lose recorded");
    } else if (req.url === "/reset") {
      callbacks.onReset && callbacks.onReset();
      res.end("State reset");
    } else {
      const filePath =
        req.url === "/"
          ? path.join(publicDir, "index.html")
          : path.join(publicDir, req.url);
      console.log(`Serving file: ${filePath}`);
      if (fs.existsSync(filePath)) {
        try {
          const stream = await fsAsync.readFile(filePath);
          const mimeType = mime.getType(filePath) || "application/octet-stream";
          res.writeHead(200, { "Content-Type": mimeType });
          res.end(stream);
        } catch (error) {
          console.error(`Error reading file: ${error.message}`);
          res.writeHead(500);
          res.end("Internal Server Error");
        }
        return;
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    }
  });

  return {
    start: (port) => {
      server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}/`);
      });
    },
    setListeners: (listeners) => {
      callbacks.onWin = listeners.onWin;
      callbacks.onLose = listeners.onLose;
      callbacks.onReset = listeners.onReset;
    },
    server,
  };
}
