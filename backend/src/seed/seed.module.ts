import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '../modules/products/entities/product.entity';
import { Sale } from '../modules/sales/entities/sale.entity';
import { SaleItem } from '../modules/sales/entities/sale-item.entity';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

import { User } from '../modules/auth/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Product, Sale, SaleItem, User])],
    controllers: [SeedController],
    providers: [SeedService],
})
export class SeedModule { }
