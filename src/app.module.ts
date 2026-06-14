import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsModule } from './admins/admins.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { MedicinesModule } from './medicines/medicines.module';
import { CustomersModule } from './customers/customers.module';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<number>('DB_PORT')) || 5432,
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    AdminsModule,

    SuppliersModule,

    MedicinesModule,

    CustomersModule,

    SalesModule,
  ],
})
export class AppModule {}
