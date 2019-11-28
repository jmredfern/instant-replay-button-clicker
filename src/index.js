"use strict";

import commandLineArgs from "command-line-args";
import client from "./client.js";
import server from "./server.js";

const optionDefinitions = [
  { name: "client", alias: "c", type: Boolean },
  { name: "server", alias: "s", type: Boolean },
  { name: "url", alias: "u", type: String },
  { name: "port", alias: "p", type: Number },
];

const options = commandLineArgs(optionDefinitions);
const { url, port } = options;

if (options.client) {
  if (!url) {
    console.log("No url specified");
    process.exit(0);
  }
  client.start({ url });
} else if (options.server) {
  if (!port) {
    console.log("No port specified");
    process.exit(0);
  }
  server.start({ port: process.env.PORT || port });
}

export default {};