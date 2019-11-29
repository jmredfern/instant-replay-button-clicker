"use strict";

import client from "./client.js";
import commandLineArgs from "command-line-args";
import server from "./server.js";
import logger from "./logger.js";

const log = logger.getLogger(import.meta.url);

const optionDefinitions = [
  { name: "client", alias: "c", type: Boolean },
  { name: "port", alias: "p", type: Number },
  { name: "server", alias: "s", type: Boolean },
  { name: "sleepTime", alias: "t", type: String },
  { name: "url", alias: "u", type: String },
];

const options = commandLineArgs(optionDefinitions);
const { port, sleepTime, url } = options;

if (options.client) {
  if (!url) {
    log.info("No url specified");
    process.exit(0);
  }
  client.start({ sleepTime, url });
} else if (options.server) {
  if (!port) {
    log.info("No port specified");
    process.exit(0);
  }
  server.start({ port: process.env.PORT || port });
}

export default {};