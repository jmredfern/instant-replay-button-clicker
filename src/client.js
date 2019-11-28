"use strict";

import WebSocket from 'ws';

const client = {};

const connect = ({ websocket }) => {
  websocket.on("open", function open() {
    console.log("Client connected");
  });

  websocket.on("message", (data) => {
    console.log(`Client received: ${data}`);
  });

  websocket.on("close", function open() {
    console.log("Client disconnected");
    connect({ websocket });
  });
}

client.start = ({ url }) => {
  const websocket = new WebSocket(url);
  connect({ websocket });
};

export default client;
