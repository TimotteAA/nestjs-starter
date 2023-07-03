import { OmitType } from '@nestjs/swagger';

import { DtoValidation } from '@/modules/core/decorators';

import { ManageQueryCategoryTreeDto } from './manage';

@DtoValidation({ type: 'query' })
export class ApiQueryCategoryTreeDto extends OmitType(ManageQueryCategoryTreeDto, ['trashed']) {}
