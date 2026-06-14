import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

export type PaymentStatus = 'PAID' | 'PENDING' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CARD';

@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  @Prop({ required: true })
  memberId: string;

  @Prop({ trim: true, default: '' })
  guardianEmail: string;

  @Prop({ required: true, default: 100 })
  amount: number;

  @Prop({ default: 'GBP' })
  currency: string;

  @Prop({ default: 'CASH' })
  paymentMethod: PaymentMethod;

  @Prop({ default: 'PAID' })
  status: PaymentStatus;

  @Prop({ required: true })
  periodStart: Date;

  @Prop({ required: true })
  periodEnd: Date;

  @Prop({ trim: true, default: '' })
  notes: string;

  @Prop({ trim: true, default: 'ADMIN' })
  recordedBy: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);