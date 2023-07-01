import * as logform from 'logform';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as Transport from 'winston-transport';

export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

export interface LoggerOptions {
    colorize?: boolean;
    emoji?: boolean;
    // other options...
}

export interface LogConfig {
    colorize?: boolean;
    emoji?: boolean;
}

export type LoggerTransportOptions = DailyRotateFile.DailyRotateFileTransportOptions;

export interface ConfiguredTransport {
    transport: Transport;
    options: LoggerOptions;
}

export type LoggerModuleOptions = {
    /**
     * 日志登记
     */
    level: string | winston.LoggerOptions;
    /**
     * 自定义的一些传输器
     */
    loggers?: ConfiguredTransport[];
    /**
     * 自定义formatter
     * @param options
     */
    formatter?: (options: LoggerOptions) => logform.Format;
    /**
     * error文件设定
     */
    error?: DailyRotateFile.DailyRotateFileTransportOptions;
    /**
     * debug文件设定
     */
    debug?: DailyRotateFile.DailyRotateFileTransportOptions;
};
