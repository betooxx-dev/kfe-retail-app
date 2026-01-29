import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '@common/index';

export class QueryProductDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by product name', example: 'Coffee' })
  @IsOptional()
  @IsString()
  search?: string;
}
