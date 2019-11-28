"use strict";

import WebSocket from 'ws';

const client = {};

const connect = ({ url }) => {
  const websocket = new WebSocket(url);
  websocket.on("open", function open() {
    console.log("Client connected");
  });

  websocket.on("message", (data) => {
    console.log(`Client received: ${data}`);
  });

  websocket.on("close", function open() {
    console.log("Client disconnected");
    connect({ url });
  });
}

client.start = ({ url }) => {
  connect({ url });
};

export default client;
