// backend/src/members/schemas/member-profile.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MemberProfileDocument = HydratedDocument<MemberProfile>;
export type Discipline = 'BOXING' | 'BJJ' | 'MUAY_THAI';

@Schema({ timestamps: true })
export class MemberProfile {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  isMinor: boolean;

  @Prop({
    type: [
      {
        guardianId: { type: String, required: true },
        relationship: String,
        canViewMedical: Boolean,
        canManagePayments: Boolean,
      },
    ],
    default: [],
  })
  guardians: {
    guardianId: string;
    relationship: string;
    canViewMedical: boolean;
    canManagePayments: boolean;
  }[];

  @Prop({
    type: {
      phone: String,
      email: String,
      address: String,
    },
  })
  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };

  @Prop({
    type: [
      {
        name: String,
        phone: String,
        relationship: String,
      },
    ],
    default: [],
  })
  emergencyContacts: {
    name: string;
    phone: string;
    relationship: string;
  }[];

  @Prop({ type: [String], default: [] })
  disciplines: Discipline[];

  @Prop({ default: 'ACTIVE' })
  membershipStatus: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'TRIAL';

  @Prop({ required: true })
  gymId: string;
}

export const MemberProfileSchema = SchemaFactory.createForClass(MemberProfile);