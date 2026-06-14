import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../admins/entities/admin.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  // This method runs automatically when the application starts
  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    const email = 'admin@pharmacy.com';
    
    // 1. Check if default admin email already exists
    const existingAdmin = await this.adminRepository.findOne({ where: { email } });

    if (existingAdmin) {
      this.logger.log('Default admin already exists. Skipping seeding.');
      return;
    }

    // 2. Hash password using bcryptjs
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 3. Create and save default admin
    const defaultAdmin = this.adminRepository.create({
      name: 'Super Admin',
      email,
      password_hash: hashedPassword,
    });

    await this.adminRepository.save(defaultAdmin);

    // 4. Log message that admin was seeded
    this.logger.log('Default admin successfully seeded.');
  }
}
