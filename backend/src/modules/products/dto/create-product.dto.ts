import {
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Americano Coffee' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product price', example: 25.5 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Initial stock', example: 100, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ description: 'Active status', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
