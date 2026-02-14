// backend/src/classes/schemas/class-session.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class ClassSession {
  @Prop({ required: true })
  classTemplateId: string;

  @Prop({ required: true })
  gymId: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ required: true })
  coachId: string;

  @Prop({ default: 'SCHEDULED' })
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export const ClassSessionSchema = SchemaFactory.createForClass(ClassSession);