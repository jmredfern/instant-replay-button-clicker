"use strict";

import { createServer } from "http";
import express from "express";
import logger from "./logger.js";
import path from "path";
import WebSocket from "ws";

const log = logger.getLoggerByUrl({ url: import.meta.url });

const server = {};

const app = express();

const expressServer = createServer(app);
const wss = new WebSocket.Server({ server: expressServer });

let websocket;
let clickPending = false;
let isConnected = false;

wss.on("connection", (ws) => {
  log.info("Client connected");
  isConnected = true;
  websocket = ws;
  if (clickPending) {
    doClick({ websocket });
  }
  websocket.on("message", (data) => {
    log.debug(`Server received: ${data}`);
  });

  websocket.on("close", () => {
    log.info("Client disconnected");
    isConnected = false;
  });
});

server.start = ({ port }) => {
  log.info('Starting server');
  expressServer.listen(port, () => {
    log.info(`Server listening on port ${port}`);
  });
};

const doClick = ({ websocket }) => {
  if (!websocket || !isConnected) {
    return;
  }
  log.info("Sending click");
  clickPending = false;
  websocket.send("click");
}

app.get("/click", (req, res) => {
  log.info("Click received");
  clickPending = true;
  doClick({ websocket });
  res.status(200).send();
})

const rootPath = path.resolve(path.dirname(''));
app.use('/', express.static(path.join(rootPath, 'public')))

export default server;
