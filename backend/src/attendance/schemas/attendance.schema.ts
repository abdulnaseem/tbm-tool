// backend/src/attendance/schemas/attendance.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AttendanceDocument = HydratedDocument<Attendance>;

export type AttendanceSession = 'CUBS' | 'TIGERS';
export type AttendanceStatus = 'PRESENT' | 'ABSENT';

@Schema({ timestamps: true, collection: 'attendance' })
export class Attendance {
  @Prop({ required: true })
  memberId: string;

  @Prop({ required: true, trim: true })
  childName: string;

  @Prop({ required: true })
  session: AttendanceSession;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop({ required: true, default: 'PRESENT' })
  status: AttendanceStatus;

  @Prop({ default: 'ADMIN' })
  markedBy: string;

  @Prop()
  markedAt: Date;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

AttendanceSchema.index(
  { memberId: 1, session: 1, date: 1 },
  { unique: true },
);