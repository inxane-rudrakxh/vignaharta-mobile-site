import app from "../dist/server/server.js";

export default async function(request) {
  return app.fetch(request);
}
