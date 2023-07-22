import { randomBytes } from 'crypto';

import { extname } from 'path';

import { MultipartFile } from '@fastify/multipart';
import { BadRequestException, Injectable } from '@nestjs/common';
import chalk from 'chalk';
import COS, { PutObjectResult } from 'cos-nodejs-sdk-v5';
import STS from 'qcloud-cos-sts';

import { getTime } from '@/modules/core/helpers';

import { SimpleUploadParams, CosStsOptions } from '../types';

@Injectable()
export class CosService {
    protected config: CosStsOptions;

    protected cos: COS;

    constructor(config: CosStsOptions) {
        this.config = config;
    }

    // 获得cos实例，直接上传
    async getCos() {
        const cos = await this.setCOS();
        return cos;
    }

    /**
     * 简单上传文件到cos中
     * @param body
     * @param mimetype
     */
    async upload(file: MultipartFile, key: string, options?: SimpleUploadParams) {
        const uploadOptions = (options ?? {}) as SimpleUploadParams;
        this.cos = await this.setCOS();
        const body = await file.toBuffer();
        const { mimetype } = file;
        let res: PutObjectResult;
        try {
            res = await this.cos.putObject({
                Bucket: this.config.bucket,
                Region: this.config.region,
                Key: key,
                StorageClass: 'MAZ_STANDARD',
                Body: body,
                ContentEncoding: mimetype,
                ...uploadOptions,
            });
        } catch (err) {
            console.log(chalk.red(err));
            throw new BadRequestException({}, 'oss上传失败，请联系服务器管理员');
        }
        return {
            status: res.statusCode,
            message: '上传成功',
        };
    }

    /**
     * 删除指定key的记录
     * @param key
     */
    async delete(prefix: string, key: string) {
        this.cos = await this.setCOS();
        try {
            await this.cos.deleteObject({
                Bucket: this.config.bucket,
                Region: this.config.region,
                Key: prefix + key,
            });
        } catch (err) {
            console.log(chalk.red(err));
            throw new BadRequestException({}, 'oss删除失败，请联系服务器管理员');
        }
    }

    async deleteMulti(items: { prefix: string; key: string }[]) {
        this.cos = await this.setCOS();
        const objects = items.map(({ prefix, key }) => ({ Key: `${prefix}/${key}` }));
        try {
            await this.cos.deleteMultipleObject({
                Objects: objects,
                Bucket: this.config.bucket,
                Region: this.config.region,
            });
        } catch (err) {
            throw new BadRequestException({});
        }
    }

    /**
     * 生成存储的key
     * @param file
     */
    async generateKey(file: string) {
        // 柑橘当前时间生成key名
        const filename = `${(await getTime()).format('YYYYMMDDHHmmss')}${randomBytes(4)
            .toString('hex')
            .slice(0, 8)}${extname(file)}`;
        return filename;
    }

    /**
     * 获取cos临时凭证，可以作为一个借口，让前端自己去传
     */
    protected async getCredential() {
        let res: any;
        // console.log(this.config.credential)
        try {
            res = await STS.getCredential(this.config.credential);
        } catch (err) {
            throw new BadRequestException({}, '获取凭证失败，请联系服务器管理员');
        }
        return res;
    }

    /**
     * 根据配置生成生成cos实例
     */
    protected async setCOS() {
        const getCredential = this.getCredential.bind(this);
        return new COS({
            async getAuthorization(_options, callback) {
                // 获取临时密钥
                const res = await getCredential();
                const auth = {
                    TmpSecretId: res.credentials.tmpSecretId, // 临时密钥的 tmpSecretId
                    TmpSecretKey: res.credentials.tmpSecretKey, // 临时密钥的 tmpSecretKey
                    SecurityToken: res.credentials.sessionToken, // 临时密钥的 sessionToken
                    ExpiredTime: res.expiredTime,
                    StartTime: res.startTime, // 临时密钥失效时间戳，是申请临时密钥时，时间戳加 durationSecon
                };
                callback(auth);
            },
            FileParallelLimit: 3,
            ChunkParallelLimit: 8,
            ChunkSize: 1024 * 1024 * 8, // 分块字节数
        });
    }
}
