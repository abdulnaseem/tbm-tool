// backend/src/users/users.service.ts
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model, Types } from 'mongoose';
  import * as bcrypt from 'bcrypt';
  
  import { User, UserDocument } from './schemas/user.schema';
  import { CreateUserDto } from './dto/create-user.dto';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { UserRole } from './enums/user-role.enum';
  
  type SafeUser = {
    id: string;
    email: string;
    roles: UserRole[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  
  @Injectable()
  export class UsersService {
    private readonly bcryptRounds = 12;
  
    constructor(
      @InjectModel(User.name)
      private readonly userModel: Model<UserDocument>,
    ) {}
  
    normalizeEmail(email: string): string {
      return email.trim().toLowerCase();
    }
  
    toSafeUser(user: UserDocument): SafeUser {
      return {
        id: user._id.toString(),
        email: user.email,
        roles: user.roles,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }
  
    private validateId(id: string): void {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid user ID');
      }
    }
  
    async findAll(): Promise<SafeUser[]> {
      const users = await this.userModel
        .find()
        .sort({ createdAt: -1 })
        .exec();
  
      return users.map((user) => this.toSafeUser(user));
    }
  
    async findSafeById(id: string): Promise<SafeUser> {
      const user = await this.findById(id);
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      return this.toSafeUser(user);
    }
  
    async findById(id: string): Promise<UserDocument | null> {
      if (!Types.ObjectId.isValid(id)) {
        return null;
      }
  
      return this.userModel.findById(id).exec();
    }
  
    async findByEmail(email: string): Promise<UserDocument | null> {
      return this.userModel
        .findOne({ email: this.normalizeEmail(email) })
        .exec();
    }
  
    async findForAuthentication(
      email: string,
    ): Promise<UserDocument | null> {
      return this.userModel
        .findOne({ email: this.normalizeEmail(email) })
        .select('+passwordHash +refreshTokenHash')
        .exec();
    }
  
    async findWithRefreshToken(
      id: string,
    ): Promise<UserDocument | null> {
      if (!Types.ObjectId.isValid(id)) {
        return null;
      }
  
      return this.userModel
        .findById(id)
        .select('+refreshTokenHash')
        .exec();
    }
  
    async create(dto: CreateUserDto): Promise<SafeUser> {
      const email = this.normalizeEmail(dto.email);
  
      const existingUser = await this.userModel.exists({ email });
  
      if (existingUser) {
        throw new ConflictException('A user with this email already exists');
      }
  
      const passwordHash = await bcrypt.hash(
        dto.password,
        this.bcryptRounds,
      );
  
      try {
        const user = await this.userModel.create({
          email,
          passwordHash,
          roles: dto.roles?.length ? dto.roles : [UserRole.STAFF],
          isActive: dto.isActive ?? true,
        });
  
        return this.toSafeUser(user);
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new ConflictException(
            'A user with this email already exists',
          );
        }
  
        throw error;
      }
    }
  
    async update(
      id: string,
      dto: UpdateUserDto,
      actingUserId: string,
    ): Promise<SafeUser> {
      this.validateId(id);
  
      const user = await this.userModel.findById(id).exec();
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      if (dto.email) {
        const normalizedEmail = this.normalizeEmail(dto.email);
  
        const duplicate = await this.userModel.exists({
          email: normalizedEmail,
          _id: { $ne: user._id },
        });
  
        if (duplicate) {
          throw new ConflictException(
            'A user with this email already exists',
          );
        }
  
        user.email = normalizedEmail;
      }
  
      if (dto.roles) {
        const removingOwnAdminRole =
          id === actingUserId &&
          user.roles.includes(UserRole.SUPER_ADMIN) &&
          !dto.roles.includes(UserRole.SUPER_ADMIN);
  
        if (removingOwnAdminRole) {
          throw new ForbiddenException(
            'You cannot remove your own SUPER_ADMIN role',
          );
        }
  
        const removesAdminRole =
          user.roles.includes(UserRole.SUPER_ADMIN) &&
          !dto.roles.includes(UserRole.SUPER_ADMIN);
  
        if (removesAdminRole) {
          await this.assertAnotherActiveSuperAdmin(id);
        }
  
        user.roles = [...new Set(dto.roles)];
      }
  
      if (dto.isActive !== undefined) {
        if (id === actingUserId && dto.isActive === false) {
          throw new ForbiddenException(
            'You cannot deactivate your own account',
          );
        }
  
        if (
          dto.isActive === false &&
          user.roles.includes(UserRole.SUPER_ADMIN)
        ) {
          await this.assertAnotherActiveSuperAdmin(id);
        }
  
        user.isActive = dto.isActive;
  
        if (!dto.isActive) {
          user.refreshTokenHash = null;
        }
      }
  
      try {
        await user.save();
        return this.toSafeUser(user);
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new ConflictException(
            'A user with this email already exists',
          );
        }
  
        throw error;
      }
    }
  
    async updatePassword(
      id: string,
      password: string,
    ): Promise<void> {
      this.validateId(id);
  
      const passwordHash = await bcrypt.hash(
        password,
        this.bcryptRounds,
      );
  
      const result = await this.userModel.updateOne(
        { _id: id },
        {
          $set: { passwordHash },
          $unset: { refreshTokenHash: 1 },
        },
      );
  
      if (!result.matchedCount) {
        throw new NotFoundException('User not found');
      }
    }
  
    async setRefreshTokenHash(
      id: string,
      refreshTokenHash: string | null,
    ): Promise<void> {
      await this.userModel.updateOne(
        { _id: id },
        { $set: { refreshTokenHash } },
      );
    }
  
    async delete(id: string, actingUserId: string): Promise<void> {
      this.validateId(id);
  
      if (id === actingUserId) {
        throw new ForbiddenException(
          'You cannot delete your own account',
        );
      }
  
      const user = await this.userModel.findById(id).exec();
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      if (user.roles.includes(UserRole.SUPER_ADMIN)) {
        await this.assertAnotherActiveSuperAdmin(id);
      }
  
      await user.deleteOne();
    }
  
    private async assertAnotherActiveSuperAdmin(
      excludedUserId: string,
    ): Promise<void> {
      const anotherAdmin = await this.userModel.exists({
        _id: { $ne: excludedUserId },
        roles: UserRole.SUPER_ADMIN,
        isActive: true,
      });
  
      if (!anotherAdmin) {
        throw new ForbiddenException(
          'The final active SUPER_ADMIN cannot be removed, deactivated, or demoted',
        );
      }
    }
  }