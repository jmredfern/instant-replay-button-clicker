"use strict";

import { createServer } from "http";
import express from "express";
import logger from "./logger.js";
import path from "path";
import WebSocket from "ws";
import exphbs from "express-handlebars";

const log = logger.getLoggerByUrl({ url: import.meta.url });

const server = {};

const app = express();

const expressServer = createServer(app);
const wss = new WebSocket.Server({ server: expressServer });

let websocket;
let clickPending = false;
let isConnected = false;
let url;

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

server.start = ({ port, url: _url }) => {
  log.info('Starting server');
  url = _url;
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

app.post("/click", (req, res) => {
  log.info("Click received");
  clickPending = true;
  doClick({ websocket });
  res.status(200).send();
})

const rootPath = path.resolve(path.dirname(''));
app.use('/assets/', express.static(path.join(rootPath, 'assets')))

const hbs = exphbs.create({
  helpers: {
      serverUrl: () => "foo.",
  }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.get('/', (req, res, next) => {
  res.render('index', {
      helpers: {
          clickUrl: () => `${url}/click`,
      }
  });
});

export default server;
