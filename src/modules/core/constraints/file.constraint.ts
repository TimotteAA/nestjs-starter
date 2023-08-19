import { FastifyMultipartBaseOptions, MultipartFile } from '@fastify/multipart';
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

/**
 * 文件大小（单位bytes）、文件数量、文件类型
 */
type FileLimitConstraint = Pick<FastifyMultipartBaseOptions['limits'], 'fileSize' | 'files'> & {
    mimetypes?: string[];
};

const checkFileAndLimit = async (file: MultipartFile, limits: FileLimitConstraint = {}) => {
    if (!('mimetype' in file)) return false;
    if (limits.mimetypes && !limits.mimetypes.includes(file.mimetype)) return false;
    const buf = await file.toBuffer();
    // console.log("buf", buf);
    // console.log("file", (file as any)._buf);
    // if (has(file, '_buf') && Buffer.byteLength((file as any)._buf) > limits.fileSize) return false;
    if (Buffer.byteLength(buf) > limits.fileSize) return false;
    return true;
};

@ValidatorConstraint({ name: 'isFileLimit' })
export class IsFileLimitConstraint implements ValidatorConstraintInterface {
    async validate(value: any, args: ValidationArguments) {
        const object = args.object as any;
        const constraint = (args.constraints[0] ?? {}) as FileLimitConstraint;
        const values = object[args.property];
        // 文件数量限制
        const filesLimit = constraint.files ?? 0;
        if (filesLimit > 0 && Array.isArray(values) && values.length > filesLimit) return false;
        const res = await checkFileAndLimit(value, constraint);
        return res;
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const { property } = validationArguments;
        const [relativeProperty] = validationArguments.constraints;
        return `${relativeProperty} and ${property} don't match`;
    }
}

/**
 * 校验dto中该字段是否与另一个字段的值相等
 * @param relativeProperty：比较的属性
 * @param validationOptions
 * @returns
 */
export function IsFileLimit(
    constraint?: FileLimitConstraint,
    validationOptions?: ValidationOptions,
) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [constraint],
            validator: IsFileLimitConstraint,
        });
    };
}
