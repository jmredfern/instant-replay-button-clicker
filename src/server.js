"use strict";

import path from "path";
import express from "express";
import {
  createServer
} from "http";

import WebSocket from "ws";

const server = {};

const app = express();

const expressServer = createServer(app);
const wss = new WebSocket.Server({
  server: expressServer
});

let websocket;
let clickPending = false;
let connected = false;

wss.on("connection", (ws) => {
  console.log("Client connected");
  connected = true;
  websocket = ws;
  if (clickPending) {
    doClick({ websocket });
  }
  websocket.on("message", (data) => {
    console.log(`Client received: ${data}`);
  });

  websocket.on("close", () => {
    console.log("Client disconnected");
    connected = false;
  });
});

server.start = ({ port }) => {
  expressServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

const doClick = ({ websocket }) => {
  if (!websocket || !connected) {
    return;
  }
  console.log("Sending click");
  clickPending = false;
  websocket.send("click");
}

app.get("/click", (req, res) => {
  console.log("Click received");
  clickPending = true;
  doClick({ websocket });
  res.status(200).send();
})

const __dirname = path.resolve(path.dirname(''));
app.use('/', express.static(path.join(__dirname, 'public')))

export default server;
