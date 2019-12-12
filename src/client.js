"use strict";

import WebSocket from "ws";
import dateFns from "date-fns";
import logger from "./logger.js";
import { exec } from "child_process";

const log = logger.getLoggerByUrl({ url: import.meta.url });
const { parse, differenceInMilliseconds, addMinutes, addDays, isWithinInterval, isBefore, subDays } = dateFns;

let isConnected;
let keyToPress;
let sleepLengthMins;
let sleepTime;
let websocketUrl;

const DEFAULT_SLEEP_LENGTH_MINUTES = 7 * 60;
const KEEP_ALIVE_LENGTH_SECONDS = 50;
const ERROR_RETRY_TIMEOUT = 5000;

const client = {};

const getSleepSchedule = ({ sleepLengthMins = DEFAULT_SLEEP_LENGTH_MINUTES, sleepTime }) => {
  const now = new Date();
  const sleepDate2 = parse(sleepTime, "HH:mm", new Date());
  const wakeDate2 = addMinutes(sleepDate2, sleepLengthMins);
  const sleepDate1 = subDays(sleepDate2, 1);
  const wakeDate1 = subDays(wakeDate2, 1);
  const sleepDate3 = addDays(sleepDate2, 1);

  if (isWithinInterval(now, { start: sleepDate1, end: wakeDate1 })) {
    const msUntilWake = differenceInMilliseconds(wakeDate1, now);
    return { shouldBeSleeping: true, msUntilWake };
  } else if (isBefore(now, sleepDate2)) {
    const msUntilSleep = differenceInMilliseconds(sleepDate2, now);
    return { shouldBeSleeping: false, msUntilSleep };
  } else if (isWithinInterval(now, { start: sleepDate2, end: wakeDate2 })) {
    const msUntilWake = differenceInMilliseconds(wakeDate2, now);
    return { shouldBeSleeping: true, msUntilWake };
  } else {
    const msUntilSleep = differenceInMilliseconds(sleepDate3, now);
    return { shouldBeSleeping: false, msUntilSleep };
  }
}

const sendKeepAlive = ({ websocket }) => {
  log.debug('Sending keep-alive');
  websocket.send("ping");
};

const processKeepAlive = ({ websocket }) => {
  setTimeout(() => {
    if (!isConnected) {
      return;
    }
    if (sleepTime === undefined) {
      sendKeepAlive({ websocket });
      processKeepAlive({ websocket });
      return;
    }
    const { shouldBeSleeping } = getSleepSchedule({ sleepLengthMins, sleepTime });
    if (shouldBeSleeping) {
      websocket.close();
    } else {
      sendKeepAlive({ websocket });
      processKeepAlive({ websocket });
    }
  }, KEEP_ALIVE_LENGTH_SECONDS * 1000);
}

const pressKey = ({ keyToPress }) => {
  exec(`osascript -e 'tell application "System Events"' -e 'keystroke "${keyToPress}"' -e 'end tell'`);
}

const connect = () => {
  log.info(`Connecting to ${websocketUrl}`);
  const websocket = new WebSocket(websocketUrl);
  let connectionErrored = false;
  websocket.on("open", () => {
    log.info("Client connected");
    isConnected = true;
    connectionErrored = false;
    processKeepAlive({ websocket });
  });

  websocket.on("message", (data) => {
    log.info(`Client received: ${data}`);
    if (keyToPress !== undefined && data === "click") {
      log.info(`Pressing key: ${keyToPress}`);
      pressKey({ keyToPress });
    }
  });

  websocket.on("close", () => {
    log.info("Client disconnected");
    isConnected = false;
    setTimeout(() => {
      scheduleConnect({ sleepLengthMins, sleepTime, websocketUrl });
    }, connectionErrored ? ERROR_RETRY_TIMEOUT : 0);
  });
  websocket.on("error", () => {
    connectionErrored = true;
    log.error(`Connection error, retrying in ${ERROR_RETRY_TIMEOUT / 1000} seconds`);
  });
}

const scheduleConnect = () => {
  if (sleepTime === undefined) {
    connect();
    return;
  }
  const { shouldBeSleeping, msUntilWake } = getSleepSchedule({ sleepLengthMins, sleepTime });
  if (shouldBeSleeping) {
    log.info(`Sleeping for another ${msUntilWake/1000} seconds`);
    setTimeout(() => {
      log.info('Waking up');
      connect();
    }, msUntilWake);
  } else {
    connect();
  }
}

client.start = ({
    keyToPress: _keyToPress,
    sleepLengthMins: _sleepLengthMins,
    sleepTime: _sleepTime,
    websocketUrl: _websocketUrl }) => {
  isConnected = false;
  keyToPress = _keyToPress;
  sleepLengthMins = _sleepLengthMins;
  sleepTime = _sleepTime;
  websocketUrl = _websocketUrl;
  log.info(`Starting client (keyToPress: ${keyToPress}, sleepLengthMins: ${sleepLengthMins}, ` +
    `sleepTime: ${sleepTime}, websocketUrl: ${websocketUrl})`);
  scheduleConnect()
};

export default client;
