const winston = require('winston');

const redactSecrets = winston.format((info) => {
  if (info.message) {
    info.message = info.message
      .replace(/password["\s:=]+[^\s"']+/gi, 'password=[REDACTED]')
      .replace(/EMAIL_PASS["\s:=]+[^\s"']+/gi, 'EMAIL_PASS=[REDACTED]')
      .replace(/MAIL_PASS["\s:=]+[^\s"']+/gi, 'MAIL_PASS=[REDACTED]')
      .replace(/JWT_SECRET["\s:=]+[^\s"']+/gi, 'JWT_SECRET=[REDACTED]')
      .replace(/token["\s:=]+[^\s"']+/gi, 'token=[REDACTED]')
      .replace(/auth["\s:=]+[^\s"']+/gi, 'auth=[REDACTED]');
  }
  return info;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    redactSecrets(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'tanzania-safari' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
