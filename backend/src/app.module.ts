import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { envs } from '@config/index';
import { ProductsModule } from '@modules/products/products.module';
import { ReportsController } from '@modules/reports/reports.controller';
import { ReportsService } from '@modules/reports/reports.service';
import { SalesModule } from '@modules/sales/sales.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ssl: envs.stage === 'prod',
      extra: {
        ssl: envs.stage === 'prod' ? { rejectUnauthorized: false } : false,
      },
      type: 'postgres',
      host: envs.dbHost,
      port: envs.dbPort,
      database: envs.dbName,
      username: envs.dbUser,
      password: envs.dbPassword,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ProductsModule,
    SalesModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class AppModule {}
