import chalk from 'chalk';
import { inspect } from 'util';
import { createLogger, format, Logger, transports } from 'winston';
import RotateFile from 'winston-daily-rotate-file';

export default class Winston {
  constructor (projectName: string, prefix = '') {
    this.logger = createLogger({
      exitOnError: false,
      format: this.baseFormat(prefix),
      transports: [
        new transports.Console(),
        new RotateFile({
          dirname: process.cwd() + '/logs',
          filename: `${projectName}.%DATE%.log`,
          format: format.uncolorize(),
          maxFiles: '15d'
        }),
        new RotateFile({
          dirname: process.cwd() + '/logs',
          filename: `${projectName}.%DATE%.error.log`,
          level: 'error',
          format: format.uncolorize(),
          maxFiles: '15d'
        }),
      ]
    });
  }

  public logger: Logger;

  protected baseFormat (prefix?: string) {
    const formatMessage = log => [
      prefix ? `${prefix} ` : '',
      `${this.setColour('timestamp', this.time)}: [${this.setColour(log.level)}] `,
      log.message,
    ].join('');
    const formatError = log => [
      prefix ? `${prefix} ` : '',
      `${this.setColour('timestamp', this.time)}: [${this.setColour(log.level)}] `,
      `${log.message}\n  ${log.stack}\n`,
    ].join('');
    const _format = log =>
      log instanceof Error
        ? formatError(log)
        : formatMessage(
            typeof log.message === 'string'
            ? log
            : Object.create({ level: log.level, message: inspect(log.message, { showHidden: true, depth: 1 }) })
          );

    return format.combine(format.printf(_format));
  }

  protected setColour (type: string, content?: string) {
    type = type.toUpperCase();
    const lowerType = type.toLowerCase();

    if (process.env.NODE_ENV === 'production')
      return lowerType === 'timestamp' ? content : type;

    switch (lowerType) {
      default: return chalk.cyan(type);
      case 'info': return chalk.greenBright(type);
      case 'debug': return chalk.magentaBright(type);
      case 'warn': return chalk.yellowBright(type);
      case 'error': return chalk.redBright(type);
      case 'timestamp': return chalk.bgMagenta.whiteBright(content);
    }
  }

  get time () {
    const now = new Date();
    const day = String(now.getDate());
    const month = String(now.getMonth() + 1);
    const hour = String(now.getHours());
    const minute = String(now.getMinutes());
    const second = String(now.getSeconds());

    const parsedDay = `${day.length <= 1 ? 0 : ''}${day}`;
    const parsedMonth = `${month.length <= 1 ? 0 : ''}${month}`;
    const parsedHour = `${hour.length <= 1 ? 0 : ''}${hour}`;
    const parsedMinute = `${minute.length <= 1 ? 0 : ''}${minute}`;
    const parsedSecond = `${second.length <= 1 ? 0 : ''}${second}`;

    return `${parsedDay}/${parsedMonth}, ${parsedHour}:${parsedMinute}:${parsedSecond}`;
  }
}
