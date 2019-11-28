"use strict";

import WebSocket from 'ws';

const client = {};

client.start = ({ url }) => {
  const ws = new WebSocket(url);

  ws.on("open", function open() {
    console.log("Client connected");
  });

  ws.on("message", (data) => {
    console.log(`Client received: ${data}`);
  });

};

export default client;