// backend/src/attendance/schemas/attendance.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProgrammeId } from '../../common/enums/programme-id.enum';

export type AttendanceDocument = HydratedDocument<Attendance>;

export type AttendanceSession =
  | 'CUBS'
  | 'TIGERS'
  | 'JUNIORS'
  | 'ADULTS';

export type AttendanceStatus = 'PRESENT' | 'ABSENT';

@Schema({
  timestamps: true,
  collection: 'attendance',
  versionKey: false,
})
export class Attendance {
  @Prop({
    type: String,
    enum: ProgrammeId,
    required: true,
    index: true,
  })
  gymId: ProgrammeId;

  @Prop({ required: true, index: true })
  memberId: string;

  @Prop({ required: true, trim: true })
  childName: string;

  @Prop({ required: true, index: true })
  session: AttendanceSession;

  @Prop({ required: true, index: true })
  date: string;

  @Prop({ required: true, default: 'PRESENT' })
  status: AttendanceStatus;

  @Prop({ default: 'ADMIN' })
  markedBy: string;

  @Prop()
  markedAt: Date;
}

export const AttendanceSchema =
  SchemaFactory.createForClass(Attendance);

AttendanceSchema.index(
  {
    gymId: 1,
    memberId: 1,
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