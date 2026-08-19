import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MemberProfileDocument = HydratedDocument<MemberProfile>;

export type Discipline = 'BOXING' | 'BJJ' | 'MUAY_THAI';

export type MembershipStatus =
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'EXPIRED'
  | 'TRIAL';

export type Session =
  | 'CUBS'
  | 'TIGERS'
  | 'JUNIORS'
  | 'ADULTS'
  | 'UNKNOWN';

export type ProgrammeId =
  | 'BRAWLERS_BOXING'
  | 'THE_GRAPPLE_HUB';

export enum BjjYouthBelt {
  WHITE = 'WHITE',

  GREY_WHITE = 'GREY_WHITE',
  GREY = 'GREY',
  GREY_BLACK = 'GREY_BLACK',

  YELLOW_WHITE = 'YELLOW_WHITE',
  YELLOW = 'YELLOW',
  YELLOW_BLACK = 'YELLOW_BLACK',

  ORANGE_WHITE = 'ORANGE_WHITE',
  ORANGE = 'ORANGE',
  ORANGE_BLACK = 'ORANGE_BLACK',

  GREEN_WHITE = 'GREEN_WHITE',
  GREEN = 'GREEN',
  GREEN_BLACK = 'GREEN_BLACK',
}

@Schema({
  timestamps: true,
  collection: 'members',
})
export class MemberProfile {
  @Prop({
    default: 'GUARDIAN',
  })
  accountType: 'GUARDIAN';

  @Prop({
    trim: true,
    default: '',
  })
  guardianFirstName: string;

  @Prop({
    trim: true,
    default: '',
  })
  guardianMiddleName: string;

  @Prop({
    trim: true,
    default: '',
  })
  guardianLastName: string;

  @Prop({
    lowercase: true,
    trim: true,
    default: '',
  })
  email: string;

  @Prop({
    trim: true,
    default: 'Guardian',
  })
  relationship: string;

  @Prop({
    trim: true,
    default: '',
  })
  phone: string;

  @Prop({
    trim: true,
    default: '',
  })
  childFirstName: string;

  @Prop({
    trim: true,
    default: '',
  })
  childMiddleName: string;

  @Prop({
    trim: true,
    default: '',
  })
  childLastName: string;

  @Prop({
    trim: true,
    default: '',
  })
  childsGender: string;

  @Prop()
  childDateOfBirth?: Date;

  @Prop({
    default: 'UNKNOWN',
  })
  session: Session;

  @Prop({
    type: [String],
    default: ['BOXING'],
  })
  disciplines: Discipline[];

  @Prop({
    default: 'ACTIVE',
  })
  membershipStatus: MembershipStatus;

  @Prop({
    trim: true,
    default: '',
  })
  allergies: string;

  @Prop({
    trim: true,
    default: '',
  })
  medicalConditions: string;

  @Prop({
    trim: true,
    default: '',
  })
  medications: string;

  @Prop({
    trim: true,
    default: '',
  })
  emergencyContactName: string;

  @Prop({
    trim: true,
    default: '',
  })
  emergencyContactPhone: string;

  @Prop({
    trim: true,
    default: '',
  })
  safeguardingNotes: string;

  @Prop({
    default: true,
  })
  consentSafeguarding: boolean;

  @Prop({
    default: true,
  })
  consentData: boolean;

  @Prop({
    default: false,
  })
  consentPhotography: boolean;

  @Prop({
    default: 100,
  })
  totalPrice: number;

  @Prop({
    trim: true,
    default: 'IMPORTED_FROM_SHEET',
  })
  paymentIntentId: string;

  @Prop({
    trim: true,
    default: 'BRAWLERS_BOXING',
    index: true,
  })
  gymId: ProgrammeId;

  @Prop({
    trim: true,
    default: 'GOOGLE_SHEET_IMPORT',
  })
  importSource: string;

  /*
   * BJJ DEVELOPMENT
   */

  @Prop({
    type: Date,
    default: null,
  })
  trainingStartDate?: Date | null;

  @Prop({
    type: String,
    enum: Object.values(BjjYouthBelt),
    default: BjjYouthBelt.WHITE,
  })
  bjjBelt: BjjYouthBelt;

  @Prop({
    type: Number,
    min: 0,
    max: 4,
    default: 0,
  })
  bjjStripes: number;

  @Prop({
    type: Date,
    default: null,
  })
  lastGradingDate?: Date | null;

  @Prop({
    trim: true,
    default: '',
  })
  gradingNotes: string;
}

export const MemberProfileSchema =
  SchemaFactory.createForClass(MemberProfile);

MemberProfileSchema.index({
  gymId: 1,
  session: 1,
});

MemberProfileSchema.index({
  gymId: 1,
  childFirstName: 1,
  childLastName: 1,
});