'use strict';

const { createServer } = require('http');
const express = require('express');
const logger = require('./logger.js');
const path = require('path');
const WebSocket = require('ws');
const exphbs = require('express-handlebars');
const { Machine, interpret } = require('xstate');

const log = logger.getLoggerByFilename({ filename: __filename });

const app = express();

const expressServer = createServer(app);
const wss = new WebSocket.Server({ server: expressServer });

let websocket;
let clickPending = false;
let isConnected = false;
let serverUrl;

wss.on('connection', (ws) => {
  log.info('Client connected');
  isConnected = true;
  websocket = ws;
  if (clickPending) {
    processClick({ websocket });
  }
  websocket.on('message', (data) => {
    log.debug(`Server received: ${data}`);
  });

  websocket.on('close', () => {
    log.info('Client disconnected');
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
  log.info('Sending click');
  clickPending = false;
  websocket.send('click');
}

app.post('/click', (req, res) => {
  log.info('Click received');
  toggleService.send('TOGGLE');
  // processClick({ websocket });
  res.status(200).send();
})

app.post('/anti-idle', (req, res) => {
  log.info('Anti-idle triggered');
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

// Stateless machine definition
// machine.transition(...) is a pure function used by the interpreter.
const toggleMachine = Machine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: { on: { TOGGLE: 'active' } },
    active: { on: { TOGGLE: 'inactive' } }
  }
});
 
// Machine instance with internal state
const toggleService = interpret(toggleMachine)
  .onTransition(state => console.log(state.value))
  .start();

module.exports = server;
