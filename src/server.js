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
const __dirname = path.resolve(path.dirname(''));

let websocket;

wss.on("connection", (ws) => {
  websocket = ws;
  console.log("Client connected");
  ws.on("message", (data) => {
    console.log(`Client received: ${data}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.start = ({ port }) => {
  expressServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

app.get("/click", (req, res) => {
  console.log("Sending click");
  websocket.send("click");
  res.status(200).send();
})

app.use('/', express.static(path.join(__dirname, 'public')))

export default server;