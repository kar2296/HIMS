const winston = require('winston');
const winstonRotator = require('winston-daily-rotate-file');

// const errorStackTracerFormat = winston.format(info => {
//   if (info.meta && info.meta instanceof Error) {
//       info.message = `${info.message} ${info.meta.stack}`;
//   }
//   return info;
// });
var logger = new winston.createLogger({
  // level: 'debug',
  // format: winston.format.combine(
  //   winston.format.timestamp(),
  //   winston.format.errors({ stack: true }),
  // ),
  // format: winston.format.combine(
  //   // winston.format.errors({ stack: true }),
  //   winston.format.timestamp(),
  //   // winston.format.colorize(),
  //   winston.format.printf(({ level, message, timestamp, stack }) => {
  //           if (stack) {
  //               // print log trace
  //               return `${timestamp} ${level}: ${message} - ${stack}`;
  //           }
  //           // return `${timestamp} ${level}: ${message}`;
  //       }),
  //   ),
    format: winston.format.combine(
      winston.format.errors({ stack: true }), // <-- use errors format
      // winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.prettyPrint()
  ),
  transports: [
    new (winston.transports.DailyRotateFile)({
      name: 'access-file',
      level: 'info',
      filename: './logs/access.log',
      json: true,
      datePattern: 'yyyy-MM-DD',
      prepend: true,
      maxFiles: 10
    }),
    new (winston.transports.DailyRotateFile)({
      name: 'error-file',
      level: 'error',
      filename: './logs/error.log',
      json: true,
      datePattern: 'yyyy-MM-DD',
      prepend: true,
      maxFiles: 10
    }), new winston.transports.Console()
  ]
});


module.exports = {
  logger
};

// export { logger as any };
// export class Logger {
//  logger;
// }
