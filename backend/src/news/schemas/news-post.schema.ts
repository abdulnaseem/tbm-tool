// backend/src/news/schemas/news-post.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class NewsPost {
  @Prop({ required: true })
  gymId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ required: true })
  createdByUserId: string;

  @Prop({ default: Date.now })
  publishedAt: Date;
}

export const NewsPostSchema = SchemaFactory.createForClass(NewsPost);