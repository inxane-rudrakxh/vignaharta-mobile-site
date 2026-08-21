import * as http from "node:http";
import { ProjectStore } from "./projectStore";

export class DashboardServer {
  private server?: http.Server;
  constructor(private readonly store: ProjectStore) {}

  start(port = 4174) {
    if (this.server) return;
    this.server = http.createServer((request, response) => {
      response.setHeader("Access-Control-Allow-Origin", "http://localhost:4173");
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      if (request.url === "/data") { response.writeHead(200); response.end(JSON.stringify(this.store.exportPayload())); return; }
      response.writeHead(404); response.end(JSON.stringify({ error: "Not found" }));
    });
    this.server.on("error", () => { this.server = undefined; });
    this.server.listen(port, "127.0.0.1");
  }

  dispose() { this.server?.close(); this.server = undefined; }
}
