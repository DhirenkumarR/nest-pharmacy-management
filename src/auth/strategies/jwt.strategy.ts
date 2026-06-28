import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Admin } from '../../admins/entities/admin.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super_secret_pharmacy_key',
    });
  }

  // Decodes the JWT token payload and loads the matching Admin from the database
  async validate(payload: any) {
    const admin = await this.adminRepository.findOne({
      where: { admin_id: payload.sub },
    });

    if (!admin) {
      throw new UnauthorizedException('Access denied. Admin user not found.');
    }

    // Return the safe admin object (excluding password hash) to be bound to req.user
    const { password_hash, ...safeAdmin } = admin;
    return safeAdmin;
  }
}
