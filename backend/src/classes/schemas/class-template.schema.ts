// backend/src/classes/schemas/class-template.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class ClassTemplate {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  discipline: 'BOXING' | 'BJJ' | 'MUAY_THAI';

  @Prop({ type: String })
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  @Prop({ required: true })
  defaultCoachId: string;

  @Prop({
    type: [
      {
        dayOfWeek: Number,
        startTime: String,
        durationMinutes: Number,
      },
    ],
  })
  schedule: {
    dayOfWeek: number;
    startTime: string;
    durationMinutes: number;
  }[];

  @Prop()
  capacity?: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  gymId: string;
}

export const ClassTemplateSchema = SchemaFactory.createForClass(ClassTemplate);