import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
  ) {}

  async create(data: any) {
    const payment = await this.paymentModel.create({
      memberId: data.memberId,
      guardianEmail: data.guardianEmail || '',
      amount: Number(data.amount || 100),
      currency: data.currency || 'GBP',
      paymentMethod: data.paymentMethod || 'CASH',
      status: data.status || 'PAID',
      periodStart: new Date(data.periodStart),
      periodEnd: new Date(data.periodEnd),
      notes: data.notes || '',
      recordedBy: data.recordedBy || 'ADMIN',
    });

    return payment.toObject();
  }

  async findByMember(memberId: string) {
    return this.paymentModel
      .find({ memberId })
      .sort({ periodStart: -1 })
      .lean();
  }

  async update(id: string, data: any) {
    const payment = await this.paymentModel
      .findByIdAndUpdate(
        id,
        {
          amount: Number(data.amount || 100),
          currency: data.currency || 'GBP',
          paymentMethod: data.paymentMethod || 'CASH',
          status: data.status || 'PAID',
          periodStart: new Date(data.periodStart),
          periodEnd: new Date(data.periodEnd),
          notes: data.notes || '',
          recordedBy: data.recordedBy || 'ADMIN',
        },
        { new: true, runValidators: true },
      )
      .lean();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async delete(id: string) {
    const payment = await this.paymentModel.findByIdAndDelete(id).lean();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return { success: true };
  }

  async hasActivePayment(memberId: string) {
    const now = new Date();

    const payment = await this.paymentModel.findOne({
      memberId,
      status: 'PAID',
      periodStart: { $lte: now },
      periodEnd: { $gte: now },
    });

    return Boolean(payment);
  }
}