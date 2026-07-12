// backend/src/payments/schemas/payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD',
}

@Schema({
  timestamps: true,
  collection: 'payments',
  versionKey: false,
})
export class Payment {
  @Prop({
    required: true,
    index: true,
  })
  memberId: string;

  @Prop({
    trim: true,
    lowercase: true,
    default: '',
  })
  guardianEmail: string;

  @Prop({
    required: true,
    min: 0,
  })
  amount: number;

  @Prop({
    trim: true,
    uppercase: true,
    default: 'GBP',
  })
  currency: string;

  @Prop({
    type: String,
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
    index: true,
  })
  paymentMethod: PaymentMethod;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.PAID,
    index: true,
  })
  status: PaymentStatus;

  @Prop({
    required: true,
    index: true,
  })
  periodStart: Date;

  @Prop({
    required: true,
    index: true,
  })
  periodEnd: Date;

  @Prop({
    trim: true,
    default: '',
  })
  notes: string;

  @Prop({
    trim: true,
    default: '',
  })
  recordedBy: string;

  createdAt: Date;
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ paymentMethod: 1, createdAt: -1 });
PaymentSchema.index({ memberId: 1, periodStart: -1 });
PaymentSchema.index({ periodStart: 1, periodEnd: 1 });