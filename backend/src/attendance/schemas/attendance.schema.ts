import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AttendanceDocument = HydratedDocument<Attendance>;

export type AttendanceSession =
  | 'CUBS'
  | 'TIGERS'
  | 'JUNIORS'
  | 'ADULTS';

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT';

export type AttendanceProgrammeId =
  | 'BRAWLERS_BOXING'
  | 'THE_GRAPPLE_HUB';

@Schema({
  timestamps: true,
  collection: 'attendance',
})
export class Attendance {
  @Prop({
    required: true,
    index: true,
  })
  memberId: string;

  @Prop({
    required: true,
    trim: true,
  })
  childName: string;

  @Prop({
    required: true,
    index: true,
  })
  gymId: AttendanceProgrammeId;

  @Prop({
    required: true,
  })
  session: AttendanceSession;

  @Prop({
    required: true,
  })
  date: string;

  @Prop({
    required: true,
    default: 'PRESENT',
  })
  status: AttendanceStatus;

  @Prop({
    default: 'ADMIN',
  })
  markedBy: string;

  @Prop()
  markedAt: Date;
}

export const AttendanceSchema =
  SchemaFactory.createForClass(Attendance);

AttendanceSchema.index(
  {
    memberId: 1,
    gymId: 1,
    session: 1,
    date: 1,
  },
  {
    unique: true,
  },
);

AttendanceSchema.index({
  gymId: 1,
  date: -1,
});

AttendanceSchema.index({
  memberId: 1,
  gymId: 1,
});