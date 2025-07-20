import { WebSocket, WebSocketServer } from "ws";

export default class WebSocketManager {
  constructor({ httpServer }) {
    this.wss = new WebSocketServer({ server: httpServer });
    this.callbacks = {};

    this.wss.on("connection", (ws) => {
      this.waitForSocketConnection(ws, () => {
        console.log("WebSocket connection established");
        if (this.callbacks.onConnection) {
          this.callbacks.onConnection(ws);
        }
      });
    });
  }

  waitForSocketConnection(ws, callback) {
    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        console.log("Connection is made");
        if (callback != null) {
          callback();
        }
      } else {
        console.log("wait for connection...");
        this.waitForSocketConnection(ws, callback);
      }
    }, 100);
  }

  broadcast(command, data) {
    this.wss.clients.forEach((client) => {
      this.send(client, command, data);
    });
  }

  send(ws, command, data) {
    if (ws.readyState === WebSocket.OPEN) {
      console.log(`Sending command: ${command} with data:`, data);
      ws.send(JSON.stringify({ command, data }));
    }
  }

  setListeners(listeners) {
    this.callbacks = {
      ...this.callbacks,
      ...listeners,
    };
  }
}
