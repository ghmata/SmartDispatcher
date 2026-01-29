const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const pathHelper = require('./pathHelper');
const config = require('../../../config.json');

const logDir = pathHelper.getLogsDir();

// Define log format
// PII Masking Helper
const maskPII = winston.format((info) => {
  if (typeof info.message === 'string') {
    // Mask phone numbers (5511999998888 -> 55119****8888)
    info.message = info.message.replace(/\b(55\d{2})(\d{4,5})(\d{4})\b/g, '$1****$3');
  }
  return info;
});

const logFormat = winston.format.combine(
  maskPII(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
      : `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Configure transports
const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
    level: 'debug' // Verbose in console for dev
  }),
  new DailyRotateFile({
    filename: path.join(logDir, 'app-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: config.logging.maxSize || '10m',
    maxFiles: config.logging.maxFiles || '7d',
    level: config.logging.level || 'info'
  }),
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: config.logging.maxSize || '10m',
    maxFiles: '14d',
    level: 'error'
  })
];

const logger = winston.createLogger({
  level: config.logging.level || 'info',
  format: logFormat,
  transports: transports
});

module.exports = logger;
