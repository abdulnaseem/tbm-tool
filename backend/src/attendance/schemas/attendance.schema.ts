// backend/src/attendance/schemas/attendance.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class AttendanceRecord {
  @Prop({ required: true })
  memberId: string;

  @Prop({ required: true })
  classSessionId: string;

  @Prop({ required: true })
  checkInTime: Date;

  @Prop({ required: true })
  method: 'MEMBER_QR' | 'SESSION_QR' | 'MANUAL';

  @Prop({ required: true })
  source: 'APP' | 'KIOSK' | 'PORTAL';

  @Prop()
  createdBy?: string;
}

export const AttendanceRecordSchema = SchemaFactory.createForClass(AttendanceRecord);