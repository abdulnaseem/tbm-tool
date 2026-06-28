import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import {
  MemberProfile,
  MemberProfileDocument,
} from '../members/schemas/member-profile.schema';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,

    @InjectModel(MemberProfile.name)
    private memberModel: Model<MemberProfileDocument>,

    private readonly mailService: MailService,
  ) {}

  async create(data: any) {
    const payment = await this.paymentModel.create({
      memberId: data.memberId,
      guardianEmail: data.guardianEmail || '',
      amount: Number(data.amount || 100),
      currency: data.currency || 'GBP',
      paymentMethod: data.paymentMethod || 'CASH',
      status: data.status || 'PAID',
      periodStart: new Date(data.periodStart || '2026-07-04'),
      periodEnd: new Date(data.periodEnd || '2026-09-26'),
      notes: data.notes || '',
      recordedBy: data.recordedBy || 'ADMIN',
    });

    const member = await this.memberModel.findById(data.memberId).lean();

    if (member?.email) {
      try {
        await this.mailService.sendPaymentReceipt({
          to: member.email,
          guardianName: `${member.guardianFirstName || ''} ${member.guardianLastName || ''}`.trim(),
          childName: `${member.childFirstName || ''} ${member.childLastName || ''}`.trim(),
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          paidAt: new Date().toLocaleDateString('en-GB'),
          periodStart: 'Saturday 4th July 2026',
          periodEnd: 'Saturday 26th September 2026',
        });
      } catch (error) {
        console.error('Payment receipt email failed:', error);
      }
    }

    return payment.toObject();
  }

  async findByMember(memberId: string) {
    return this.paymentModel.find({ memberId }).sort({ periodStart: -1 }).lean();
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
          periodStart: new Date(data.periodStart || '2026-07-04'),
          periodEnd: new Date(data.periodEnd || '2026-09-26'),
          notes: data.notes || '',
          recordedBy: data.recordedBy || 'ADMIN',
        },
        { new: true, runValidators: true },
      )
      .lean();

    if (!payment) throw new NotFoundException('Payment not found');

    return payment;
  }

  async delete(id: string) {
    const payment = await this.paymentModel.findByIdAndDelete(id).lean();

    if (!payment) throw new NotFoundException('Payment not found');

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