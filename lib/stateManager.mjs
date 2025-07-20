export default class StateManager {
  constructor({ storage, wsServer }) {
    this.storage = storage;
    this.wsServer = wsServer;
    this.state = storage.load() || {
      win: 0,
      lost: 0,
      totalWins: 0,
      totalLost: 0,
    };
  }

  won = () => {
    this.state = {
      ...this.state,
      win: (this.state.win || 0) + 1,
      totalWins: (this.state.totalWins || 0) + 1,
      lost: 0,
    };
    this.storage.save(this.state);
    this.wsServer.broadcast("update", this.state);
  };

  lost = () => {
    this.state = {
      ...this.state,
      lost: (this.state.lost || 0) + 1,
      totalLost: (this.state.totalLost || 0) + 1,
      win: 0,
    };
    this.storage.save(this.state);
    this.wsServer.broadcast("update", this.state);
  };

  reset = () => {
    this.state = {
      win: 0,
      lost: 0,
      totalWins: 0,
      totalLost: 0,
    };
    this.storage.save(this.state);
    this.wsServer.broadcast("update", this.state);
  };

  updateClient = (ws) => {
    this.wsServer.send(ws, "update", this.state);
  };
}
