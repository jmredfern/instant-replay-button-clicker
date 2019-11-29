import log4js from "log4js"

log4js.configure({
  appenders: { out: { type: 'stdout', layout: { type: 'basic' } } },
  categories: { default: { appenders: ['out'], level: 'debug' } }
});

const logger = {};

logger.getLogger = (importMetaUrl) => {
  const pathname = new URL(importMetaUrl).pathname;
  const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
  return log4js.getLogger(filename);
};

export default logger;