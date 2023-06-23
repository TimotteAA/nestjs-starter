import { PutObjectParams } from 'cos-nodejs-sdk-v5';
import { GetCredentialOptions } from 'qcloud-cos-sts';

/**
 * 腾讯云短信sdk配置
 */
export type SmsSdkOptions<T extends NestedRecord = RecordNever> = {
    secretId: string;
    secretKey: string;
    region: string;
    endpoint: string;
    sign: string;
    appid: string;
} & T;

/**
 * 腾讯云获取临时授权的配置
 */
export type CosStsOptions = {
    credential: GetCredentialOptions;
    region: string;
    bucket: string;
    avatarPrefix: string;
    bannerPrefix: string;
};

/**
 * cos简单上传参数
 */
export type SimpleUploadParams = Omit<
    PutObjectParams,
    'Bucket' | 'Region' | 'Key' | 'StorageClass' | 'Body' | 'ContentEncoding'
>;

export type SendResult = { ok: boolean; message: string };
