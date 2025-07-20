import path from "node:path";
import HttpServer from "./server/http.mjs";
import WebSocketServer from "./server/websocket.mjs";
import { Storage } from "./data/storage.mjs";
import StateManager from "./stateManager.mjs";

const stateKey = process.argv[2] || "default";

const publicDir = path.join(process.cwd(), "public");
const httpServer = HttpServer({ publicDir });
const wsServer = new WebSocketServer({ httpServer: httpServer.server });
const state = new StateManager({ storage: Storage(stateKey), wsServer });

httpServer.setListeners({
  onWin: state.won,
  onLose: state.lost,
  onReset: state.reset,
});

wsServer.setListeners({
  onConnection: state.updateClient,
});

httpServer.start(3001);
