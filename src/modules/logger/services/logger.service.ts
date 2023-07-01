import clc from 'cli-color';
import { isNil } from 'lodash';
import * as emoji from 'node-emoji';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { LogConfig, LoggerModuleOptions, LoggerOptions, LoggerTransportOptions } from '../types';

export class LoggerService {
    private logger: winston.Logger;

    private DEFAULT_ERROR_FILE_OPTIONS: LoggerTransportOptions = {
        level: 'error',
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
    };

    private DEFAULT_DEBUG_FILE_OPTIONS: LoggerTransportOptions = {
        level: 'debug',
        filename: 'logs/debug-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
    };

    private requestId: string;

    constructor(options: LoggerModuleOptions) {
        const { level, loggers = [], formatter, error, debug } = options;
        // 为传入的每个 logger 设置格式化函数
        if (!isNil(loggers)) {
            loggers.forEach((logger) => {
                logger.transport.format = formatter
                    ? formatter(logger.options)
                    : this.defaultFormatter(logger.options);
            });
        }

        // 根据 level 参数的类型来创建 Winston logger
        if (typeof level === 'string' || level instanceof String) {
            this.logger = winston.createLogger({
                level: level as string,
                transports: [
                    new winston.transports.Console(),
                    new DailyRotateFile(error ?? this.DEFAULT_ERROR_FILE_OPTIONS),
                    new DailyRotateFile(debug ?? this.DEFAULT_DEBUG_FILE_OPTIONS),
                    ...loggers.map((l) => l.transport),
                ],
                format: this.defaultFormatter({ colorize: true, emoji: true }),
            });
        } else {
            const winstonLoggerOptions: winston.LoggerOptions = level;
            winstonLoggerOptions.transports = [
                new winston.transports.Console(),
                new DailyRotateFile(error ?? this.DEFAULT_ERROR_FILE_OPTIONS),
                new DailyRotateFile(debug ?? this.DEFAULT_DEBUG_FILE_OPTIONS),
                ...loggers.map((l) => l.transport),
            ];
            this.logger = winston.createLogger(winstonLoggerOptions);
        }
    }

    log(msg: any, context?: string, config?: LogConfig) {
        this.logger.info(this.dataToString(msg), { context, ...config, reqId: this.requestId });
    }

    debug(msg: any, context?: string, config?: LogConfig) {
        this.logger.debug(this.dataToString(msg), { context, ...config, reqId: this.requestId });
    }

    info(msg: any, context?: string, config?: LogConfig) {
        this.logger.info(this.dataToString(msg), { context, ...config, reqId: this.requestId });
    }

    warn(msg: any, context?: string, config?: LogConfig) {
        this.logger.warn(this.dataToString(msg), { context, ...config, reqId: this.requestId });
    }

    error(msg: any, trace?: string, context?: string, config?: LogConfig) {
        this.logger.error(this.dataToString(msg), { context, ...config, reqId: this.requestId });
        if (trace) {
            this.logger.error(trace, { context, ...config, reqId: this.requestId });
        }
    }

    /**
     * 将日志打印的内容转成字符串
     * @param msg 日志打印内容
     */
    private dataToString(msg: any) {
        return typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg;
    }

    /**
     * 默认的日志格式formatter
     * @param options
     */
    private defaultFormatter(options: LoggerOptions) {
        return winston.format.printf((info) => {
            const colorize = info.colorize !== undefined ? info.colorize : options.colorize;
            const useEmoji = info.emoji !== undefined ? info.emoji : options.emoji;

            const level = info.level.toUpperCase();

            let { message } = info;
            if (typeof info.message === 'object') {
                message = JSON.stringify(info.message, null, 2);
            }

            // 获取并添加context和meta信息
            const context = info.context ? `[${info.context}]` : '';
            const meta = info.meta ? ` ${JSON.stringify(info.meta)}` : '';

            let output = `${context} [${level}] ${message}${meta}`;
            if (colorize) {
                output = clc.green(output);
            }
            if (useEmoji) {
                const icon = this.getEmojiForLevel(level);
                output = `${icon}  ${output}`;
            }

            return output;
        });
    }

    private getEmojiForLevel(level: string) {
        switch (level) {
            case 'DEBUG':
                return emoji.get('bug');
            case 'INFO':
                return emoji.get('information_source');
            case 'WARN':
                return emoji.get('warning');
            case 'ERROR':
                return emoji.get('x');
            default:
                return '';
        }
    }
}
