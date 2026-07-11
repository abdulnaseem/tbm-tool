// backend/src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  email: string;

  @Prop({
    required: true,
    select: false,
  })
  passwordHash: string;

  @Prop({
    type: [String],
    enum: UserRole,
    default: [UserRole.STAFF],
  })
  roles: UserRole[];

  @Prop({
    default: true,
    index: true,
  })
  isActive: boolean;

  @Prop({
    select: false,
    default: null,
  })
  refreshTokenHash?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);