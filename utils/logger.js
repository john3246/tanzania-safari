const winston = require('winston');[cite: 3]

const redactSecrets = winston.format((info) => {
  //  FIXED: Enforce type check to ensure info.message is a string before running regex
  if (info.message && typeof info.message === 'string') {
    info.message = info.message
      .replace(/password["\s:=]+[^\s"']+/gi, 'password=[REDACTED]')[cite: 3]
      .replace(/EMAIL_PASS["\s:=]+[^\s"']+/gi, 'EMAIL_PASS=[REDACTED]')[cite: 3]
      .replace(/MAIL_PASS["\s:=]+[^\s"']+/gi, 'MAIL_PASS=[REDACTED]')[cite: 3]
      .replace(/JWT_SECRET["\s:=]+[^\s"']+/gi, 'JWT_SECRET=[REDACTED]')[cite: 3]
      .replace(/token["\s:=]+[^\s"']+/gi, 'token=[REDACTED]')[cite: 3]
      .replace(/auth["\s:=]+[^\s"']+/gi, 'auth=[REDACTED]');[cite: 3]
  }
  return info;[cite: 3]
});

const logger = winston.createLogger({[cite: 3]
  level: process.env.LOG_LEVEL || 'info',[cite: 3]
  format: winston.format.combine([cite: 3]
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),[cite: 3]
    redactSecrets(),[cite: 3]
    winston.format.errors({ stack: true }),[cite: 3]
    winston.format.json()[cite: 3]
  ),[cite: 3]
  defaultMeta: { service: 'tanzania-safari' },[cite: 3]
  transports: [[cite: 3]
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),[cite: 3]
    new winston.transports.File({ filename: 'logs/combined.log' })[cite: 3]
  ][cite: 3]
});[cite: 3]

if (process.env.NODE_ENV !== 'production') {[cite: 3]
  logger.add(new winston.transports.Console({[cite: 3]
    format: winston.format.combine([cite: 3]
      winston.format.colorize(),[cite: 3]
      winston.format.simple()[cite: 3]
    )[cite: 3]
  }));[cite: 3]
}[cite: 3]

module.exports = logger;[cite: 3]