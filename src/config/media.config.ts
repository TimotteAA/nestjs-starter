import { ManyToOne, OneToOne } from 'typeorm';

import { PostEntity } from '@/modules/content/entities';
import { ConfigureFactory } from '@/modules/core/types';
import { defaultMediaConfig } from '@/modules/media/helpers';
import { MediaConfig } from '@/modules/media/types';

export const media: ConfigureFactory<MediaConfig> = {
    register: () => ({
        relations: [
            {
                column: 'coverPost',
                relation: OneToOne(
                    () => PostEntity,
                    (post) => post.coverImg,
                ),
                // others: [JoinColumn()],
            },
            {
                column: 'bodyPost',
                relation: ManyToOne(
                    () => PostEntity,
                    (post) => post.bodyImgs,
                ),
                // others: [JoinColumn()],
            },
        ],
    }),
    defaultRegister: defaultMediaConfig,
};
