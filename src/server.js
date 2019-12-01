"use strict";

import { createServer } from "http";
import express from "express";
import logger from "./logger.js";
import path from "path";
import WebSocket from "ws";
import exphbs from "express-handlebars";
import dateFns from "date-fns";

const { differenceInMilliseconds } = dateFns;
const log = logger.getLoggerByUrl({ url: import.meta.url });

const app = express();

const expressServer = createServer(app);
const wss = new WebSocket.Server({ server: expressServer });

const MINIMUM_CLICK_PERIOD_MS = 30000;

let websocket;
let clickPending = false;
let isConnected = false;
let serverUrl;
let lastClickDate = null;

wss.on("connection", (ws) => {
  log.info("Client connected");
  isConnected = true;
  websocket = ws;
  if (clickPending) {
    processClick({ websocket });
  }
  websocket.on("message", (data) => {
    log.debug(`Server received: ${data}`);
  });

  websocket.on("close", () => {
    log.info("Client disconnected");
    isConnected = false;
  });
});

const server = {};

server.start = ({ port, serverUrl: _serverUrl }) => {
  log.info('Starting server');
  serverUrl = _serverUrl;
  expressServer.listen(port, () => {
    log.info(`Server listening on port ${port}`);
  });
};

const processClick = ({ websocket }) => {
  clickPending = true;
  if (!websocket || !isConnected) {
    return;
  }
  log.info("Sending click");
  clickPending = false;
  websocket.send("click");
}

const isWithinLastClickPeriod = () => {
  const clickDate = new Date();
  const result =
    lastClickDate !== null &&
    differenceInMilliseconds(clickDate, lastClickDate) < MINIMUM_CLICK_PERIOD_MS;
  if (result === false) {
    lastClickDate = clickDate;
  }
  return result;
};

app.post("/click", (req, res) => {
  log.info("Click received");
  if (isWithinLastClickPeriod()) {
    log.info('Ignoring click received within last click period');
  } else {
    processClick({ websocket });
  }
  res.status(200).send();
})

const rootPath = path.resolve(path.dirname(''));
app.use('/assets/', express.static(path.join(rootPath, 'assets')))

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.get('/', (req, res, next) => {
  res.render('index', {
      helpers: {
          clickUrl: () => `${serverUrl}/click`,
      }
  });
});

export default server;
