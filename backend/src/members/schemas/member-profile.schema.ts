// backend/src/members/schemas/member-profile.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MemberProfileDocument = HydratedDocument<MemberProfile>;

export type Discipline = 'BOXING' | 'BJJ' | 'MUAY_THAI';
export type MembershipStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'TRIAL';
export type Session = 'CUBS' | 'TIGERS' | 'ADULTS' | 'UNKNOWN';

@Schema({ timestamps: true, collection: 'members' })
export class MemberProfile {
  @Prop({ default: 'GUARDIAN' })
  accountType: 'GUARDIAN';

  @Prop({ trim: true, default: '' })
  guardianFirstName: string;

  @Prop({ trim: true, default: '' })
  guardianMiddleName: string;

  @Prop({ trim: true, default: '' })
  guardianLastName: string;

  @Prop({ lowercase: true, trim: true, default: '' })
  email: string;

  @Prop({ trim: true, default: 'Guardian' })
  relationship: string;

  @Prop({ trim: true, default: '' })
  childFirstName: string;

  @Prop({ trim: true, default: '' })
  childMiddleName: string;

  @Prop({ trim: true, default: '' })
  childLastName: string;

  @Prop({ trim: true, default: '' })
  childsGender: string;

  @Prop()
  childDateOfBirth?: Date;

  @Prop({ default: 'UNKNOWN' })
  session: Session;

  @Prop({ type: [String], default: ['BOXING'] })
  disciplines: Discipline[];

  @Prop({ default: 'ACTIVE' })
  membershipStatus: MembershipStatus;

  @Prop({ trim: true, default: '' })
  allergies: string;

  @Prop({ trim: true, default: '' })
  medicalConditions: string;

  @Prop({ trim: true, default: '' })
  medications: string;

  @Prop({ trim: true, default: '' })
  emergencyContactName: string;

  @Prop({ trim: true, default: '' })
  emergencyContactPhone: string;

  @Prop({ trim: true, default: '' })
  safeguardingNotes: string;

  @Prop({ default: true })
  consentSafeguarding: boolean;

  @Prop({ default: true })
  consentData: boolean;

  @Prop({ default: false })
  consentPhotography: boolean;

  @Prop({ default: 100 })
  totalPrice: number;

  @Prop({ trim: true, default: 'IMPORTED_FROM_SHEET' })
  paymentIntentId: string;

  @Prop({ trim: true, default: 'BRAWLERS_BOXING' })
  gymId: string;

  @Prop({ trim: true, default: 'GOOGLE_SHEET_IMPORT' })
  importSource: string;
}

export const MemberProfileSchema = SchemaFactory.createForClass(MemberProfile);