import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { AdminSeeder } from '../database/seeders/admin.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Admin])],
  providers: [AdminSeeder],
  exports: [TypeOrmModule],
})
export class AdminsModule {}
