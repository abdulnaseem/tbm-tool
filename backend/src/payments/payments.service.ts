// backend/src/payments/payments.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  PipelineStage,
  Types,
} from 'mongoose';
import * as XLSX from 'xlsx';

import {
  Payment,
  PaymentDocument,
  PaymentMethod,
  PaymentStatus,
} from './schemas/payment.schema';
import {
  MemberProfile,
  MemberProfileDocument,
} from '../members/schemas/member-profile.schema';
import { MailService } from '../mail/mail.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import {
  PaymentReportPeriod,
  PaymentReportQueryDto,
} from './dto/payment-report-query.dto';

type DateRange = {
  label: string;
  from: Date;
  to: Date;
};

type EnrichedPayment = {
  _id: Types.ObjectId;
  memberId: string;
  guardianEmail?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  periodStart: Date;
  periodEnd: Date;
  notes?: string;
  recordedBy?: string;
  createdAt: Date;
  updatedAt: Date;

  childName: string;
  guardianName: string;
  session: string;
};

@Injectable()
export class PaymentsService {
  private readonly reportTimezone: string;

  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,

    @InjectModel(MemberProfile.name)
    private readonly memberModel: Model<MemberProfileDocument>,

    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {
    this.reportTimezone =
      this.config.get<string>('REPORT_TIMEZONE') ?? 'Europe/London';
  }

  async create(
    data: CreatePaymentDto,
    recordedBy: string,
  ) {
    const member = await this.memberModel.findById(data.memberId).lean();

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const periodStart = new Date(data.periodStart);
    const periodEnd = new Date(data.periodEnd);

    if (periodStart > periodEnd) {
      throw new BadRequestException(
        'Payment period start cannot be after the end date',
      );
    }

    const payment = await this.paymentModel.create({
      memberId: data.memberId,
      guardianEmail: data.guardianEmail || member.email || '',
      amount: data.amount,
      currency: (data.currency || 'GBP').toUpperCase(),
      paymentMethod: data.paymentMethod,
      status: data.status || PaymentStatus.PAID,
      periodStart,
      periodEnd,
      notes: data.notes || '',
      recordedBy,
    });

    if (member.email && payment.status === PaymentStatus.PAID) {
      try {
        await this.mailService.sendPaymentReceipt({
          to: member.email,
          guardianName: [
            member.guardianFirstName,
            member.guardianLastName,
          ]
            .filter(Boolean)
            .join(' '),
          childName: [
            member.childFirstName,
            member.childLastName,
          ]
            .filter(Boolean)
            .join(' '),
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          paidAt: payment.createdAt.toISOString(),
          periodStart: payment.periodStart.toISOString(),
          periodEnd: payment.periodEnd.toISOString(),
        });
      } catch (error) {
        console.error('Payment receipt email failed:', error);
      }
    }

    return payment.toObject();
  }

  async findByMember(memberId: string) {
    if (!Types.ObjectId.isValid(memberId)) {
      throw new BadRequestException('Invalid member ID');
    }

    return this.paymentModel
      .find({ memberId })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findAll(query: PaymentReportQueryDto) {
    const range = this.resolveDateRange(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const pipeline = this.buildEnrichedPipeline(query, range);

    const [result] = await this.paymentModel
      .aggregate<{
        items: EnrichedPayment[];
        metadata: Array<{ total: number }>;
      }>([
        ...pipeline,
        {
          $facet: {
            items: [
              { $sort: { createdAt: -1 } },
              { $skip: skip },
              { $limit: limit },
            ],
            metadata: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    const total = result?.metadata?.[0]?.total ?? 0;

    return {
      range: {
        label: range.label,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
      },
      items: result?.items ?? [],
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  async getStatistics(query: PaymentReportQueryDto) {
    const range = this.resolveDateRange(query);
    const pipeline = this.buildEnrichedPipeline(query, range);

    const timelineDateFormat =
      query.period === PaymentReportPeriod.THIS_YEAR
        ? '%Y-%m'
        : '%Y-%m-%d';

    const [statistics] = await this.paymentModel
      .aggregate([
        ...pipeline,
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  totalRevenue: {
                    $sum: {
                      $cond: [
                        { $eq: ['$status', PaymentStatus.PAID] },
                        '$amount',
                        0,
                      ],
                    },
                  },
                  paymentCount: { $sum: 1 },
                  paidCount: {
                    $sum: {
                      $cond: [
                        { $eq: ['$status', PaymentStatus.PAID] },
                        1,
                        0,
                      ],
                    },
                  },
                  pendingCount: {
                    $sum: {
                      $cond: [
                        { $eq: ['$status', PaymentStatus.PENDING] },
                        1,
                        0,
                      ],
                    },
                  },
                  cancelledCount: {
                    $sum: {
                      $cond: [
                        { $eq: ['$status', PaymentStatus.CANCELLED] },
                        1,
                        0,
                      ],
                    },
                  },
                  paidAmountTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ['$status', PaymentStatus.PAID] },
                        '$amount',
                        0,
                      ],
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  totalRevenue: 1,
                  paymentCount: 1,
                  paidCount: 1,
                  pendingCount: 1,
                  cancelledCount: 1,
                  averagePayment: {
                    $cond: [
                      { $gt: ['$paidCount', 0] },
                      {
                        $round: [
                          {
                            $divide: [
                              '$paidAmountTotal',
                              '$paidCount',
                            ],
                          },
                          2,
                        ],
                      },
                      0,
                    ],
                  },
                },
              },
            ],

            byMethod: [
              {
                $match: {
                  status: PaymentStatus.PAID,
                },
              },
              {
                $group: {
                  _id: '$paymentMethod',
                  revenue: { $sum: '$amount' },
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  _id: 0,
                  method: '$_id',
                  revenue: { $round: ['$revenue', 2] },
                  count: 1,
                },
              },
              {
                $sort: {
                  revenue: -1,
                },
              },
            ],

            bySession: [
              {
                $match: {
                  status: PaymentStatus.PAID,
                },
              },
              {
                $group: {
                  _id: '$session',
                  revenue: { $sum: '$amount' },
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  _id: 0,
                  session: '$_id',
                  revenue: { $round: ['$revenue', 2] },
                  count: 1,
                },
              },
              {
                $sort: {
                  revenue: -1,
                },
              },
            ],

            timeline: [
              {
                $match: {
                  status: PaymentStatus.PAID,
                },
              },
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: timelineDateFormat,
                      date: '$createdAt',
                      timezone: this.reportTimezone,
                    },
                  },
                  revenue: { $sum: '$amount' },
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  _id: 0,
                  date: '$_id',
                  revenue: { $round: ['$revenue', 2] },
                  count: 1,
                },
              },
              {
                $sort: {
                  date: 1,
                },
              },
            ],

            recentPayments: [
              {
                $sort: {
                  createdAt: -1,
                },
              },
              {
                $limit: 10,
              },
              {
                $project: {
                  _id: 0,
                  id: { $toString: '$_id' },
                  memberId: 1,
                  childName: 1,
                  guardianName: 1,
                  session: 1,
                  amount: 1,
                  currency: 1,
                  paymentMethod: 1,
                  status: 1,
                  periodStart: 1,
                  periodEnd: 1,
                  recordedBy: 1,
                  createdAt: 1,
                },
              },
            ],
          },
        },
      ])
      .exec();

    const membershipSummary =
      await this.getMembershipSummary(range);

    return {
      range: {
        label: range.label,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
      },
      summary: {
        totalRevenue:
          statistics?.summary?.[0]?.totalRevenue ?? 0,
        paymentCount:
          statistics?.summary?.[0]?.paymentCount ?? 0,
        averagePayment:
          statistics?.summary?.[0]?.averagePayment ?? 0,
        paidCount:
          statistics?.summary?.[0]?.paidCount ?? 0,
        pendingCount:
          statistics?.summary?.[0]?.pendingCount ?? 0,
        cancelledCount:
          statistics?.summary?.[0]?.cancelledCount ?? 0,
        activeMemberships:
          membershipSummary.activeMemberships,
        outstandingMembers:
          membershipSummary.outstandingMembers,
      },
      byMethod: this.fillMissingPaymentMethods(
        statistics?.byMethod ?? [],
      ),
      bySession: statistics?.bySession ?? [],
      timeline: statistics?.timeline ?? [],
      recentPayments: statistics?.recentPayments ?? [],
    };
  }

  async exportPayments(query: PaymentReportQueryDto) {
    const range = this.resolveDateRange(query);
    const pipeline = this.buildEnrichedPipeline(query, range);

    const payments =
      await this.paymentModel.aggregate<EnrichedPayment>([
        ...pipeline,
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

    const rows = payments.map((payment) => ({
      'Payment Date': this.formatDateForExport(payment.createdAt),
      'Child Name': payment.childName || '',
      'Guardian Name': payment.guardianName || '',
      Session: payment.session || 'UNKNOWN',
      Amount: payment.amount,
      Currency: payment.currency,
      'Payment Method': payment.paymentMethod.replace(/_/g, ' '),
      Status: payment.status,
      'Period Start': this.formatDateForExport(payment.periodStart),
      'Period End': this.formatDateForExport(payment.periodEnd),
      'Recorded By': payment.recordedBy || '',
      Notes: payment.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet['!cols'] = [
      { wch: 16 },
      { wch: 28 },
      { wch: 28 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 20 },
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
      { wch: 30 },
      { wch: 40 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Payments',
    );

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    return {
      buffer,
      filename: `payments-${range.from
        .toISOString()
        .slice(0, 10)}-to-${range.to
        .toISOString()
        .slice(0, 10)}.xlsx`,
    };
  }

  async update(
    id: string,
    data: UpdatePaymentDto,
    recordedBy: string,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }

    const existingPayment = await this.paymentModel.findById(id);

    if (!existingPayment) {
      throw new NotFoundException('Payment not found');
    }

    const periodStart = data.periodStart
      ? new Date(data.periodStart)
      : existingPayment.periodStart;

    const periodEnd = data.periodEnd
      ? new Date(data.periodEnd)
      : existingPayment.periodEnd;

    if (periodStart > periodEnd) {
      throw new BadRequestException(
        'Payment period start cannot be after the end date',
      );
    }

    existingPayment.amount =
      data.amount ?? existingPayment.amount;

    existingPayment.currency =
      data.currency?.toUpperCase() ??
      existingPayment.currency;

    existingPayment.paymentMethod =
      data.paymentMethod ??
      existingPayment.paymentMethod;

    existingPayment.status =
      data.status ?? existingPayment.status;

    existingPayment.periodStart = periodStart;
    existingPayment.periodEnd = periodEnd;

    existingPayment.notes =
      data.notes ?? existingPayment.notes;

    existingPayment.recordedBy = recordedBy;

    await existingPayment.save();

    return existingPayment.toObject();
  }

  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }

    const payment = await this.paymentModel
      .findByIdAndDelete(id)
      .lean();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return { success: true };
  }

  async hasActivePayment(memberId: string) {
    const now = new Date();

    const payment = await this.paymentModel.exists({
      memberId,
      status: PaymentStatus.PAID,
      periodStart: { $lte: now },
      periodEnd: { $gte: now },
    });

    return Boolean(payment);
  }

  private buildEnrichedPipeline(
    query: PaymentReportQueryDto,
    range: DateRange,
  ): PipelineStage[] {
    const initialMatch: FilterQuery<PaymentDocument> = {
      createdAt: {
        $gte: range.from,
        $lte: range.to,
      },
    };

    if (query.method) {
      initialMatch.paymentMethod = query.method;
    }

    if (query.status) {
      initialMatch.status = query.status;
    }

    const pipeline: PipelineStage[] = [
      {
        $match: initialMatch,
      },

      // Existing payment memberId values are strings.
      // Convert them to ObjectId for the member lookup.
      {
        $addFields: {
          memberObjectId: {
            $convert: {
              input: '$memberId',
              to: 'objectId',
              onError: null,
              onNull: null,
            },
          },
        },
      },

      {
        $lookup: {
          from: this.memberModel.collection.name,
          localField: 'memberObjectId',
          foreignField: '_id',
          as: 'member',
        },
      },

      {
        $unwind: {
          path: '$member',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $addFields: {
          childName: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ['$member.childFirstName', ''] },
                  ' ',
                  { $ifNull: ['$member.childMiddleName', ''] },
                  ' ',
                  { $ifNull: ['$member.childLastName', ''] },
                ],
              },
            },
          },

          guardianName: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ['$member.guardianFirstName', ''] },
                  ' ',
                  { $ifNull: ['$member.guardianLastName', ''] },
                ],
              },
            },
          },

          session: {
            $ifNull: ['$member.session', 'UNKNOWN'],
          },
        },
      },
    ];

    if (query.session) {
      pipeline.push({
        $match: {
          session: query.session,
        },
      });
    }

    pipeline.push({
      $project: {
        memberObjectId: 0,
        member: 0,
      },
    });

    return pipeline;
  }

  private async getMembershipSummary(range: DateRange) {
    const requiredPeriodStart = this.startOfUtcDay(range.from);
    const requiredPeriodEnd = this.startOfUtcDay(range.to);
  
    const [paidMemberIds, totalMembers] = await Promise.all([
      this.paymentModel.distinct('memberId', {
        status: PaymentStatus.PAID,
        periodStart: { $lte: requiredPeriodStart },
        periodEnd: { $gte: requiredPeriodEnd },
      }),
  
      this.memberModel.countDocuments(),
    ]);
  
    return {
      activeMemberships: paidMemberIds.length,
      outstandingMembers: Math.max(
        totalMembers - paidMemberIds.length,
        0,
      ),
    };
  }

  private fillMissingPaymentMethods(
    methods: Array<{
      method: PaymentMethod;
      revenue: number;
      count: number;
    }>,
  ) {
    return Object.values(PaymentMethod).map((method) => {
      return (
        methods.find((item) => item.method === method) ?? {
          method,
          revenue: 0,
          count: 0,
        }
      );
    });
  }

  private resolveDateRange(
    query: PaymentReportQueryDto,
  ): DateRange {
    const period =
      query.period ?? PaymentReportPeriod.THIS_TERM;

    if (period === PaymentReportPeriod.CUSTOM) {
      if (!query.from || !query.to) {
        throw new BadRequestException(
          'Custom reports require both from and to dates',
        );
      }

      const from = this.startOfUtcDay(new Date(query.from));
      const to = this.endOfUtcDay(new Date(query.to));

      if (
        Number.isNaN(from.getTime()) ||
        Number.isNaN(to.getTime())
      ) {
        throw new BadRequestException('Invalid custom date range');
      }

      if (from > to) {
        throw new BadRequestException(
          'The from date cannot be after the to date',
        );
      }

      return {
        label: 'Custom range',
        from,
        to,
      };
    }

    const now = new Date();

    switch (period) {
      case PaymentReportPeriod.THIS_WEEK: {
        const from = this.startOfUtcWeek(now);
        const to = this.endOfUtcDay(
          new Date(
            Date.UTC(
              from.getUTCFullYear(),
              from.getUTCMonth(),
              from.getUTCDate() + 6,
            ),
          ),
        );

        return {
          label: 'This week',
          from,
          to,
        };
      }

      case PaymentReportPeriod.THIS_MONTH:
        return {
          label: 'This month',
          from: new Date(
            Date.UTC(
              now.getUTCFullYear(),
              now.getUTCMonth(),
              1,
            ),
          ),
          to: this.endOfUtcDay(
            new Date(
              Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth() + 1,
                0,
              ),
            ),
          ),
        };

      case PaymentReportPeriod.THIS_QUARTER: {
        const quarterStartMonth =
          Math.floor(now.getUTCMonth() / 3) * 3;

        return {
          label: 'This quarter',
          from: new Date(
            Date.UTC(
              now.getUTCFullYear(),
              quarterStartMonth,
              1,
            ),
          ),
          to: this.endOfUtcDay(
            new Date(
              Date.UTC(
                now.getUTCFullYear(),
                quarterStartMonth + 3,
                0,
              ),
            ),
          ),
        };
      }

      case PaymentReportPeriod.THIS_YEAR:
        return {
          label: 'This year',
          from: new Date(
            Date.UTC(now.getUTCFullYear(), 0, 1),
          ),
          to: this.endOfUtcDay(
            new Date(
              Date.UTC(now.getUTCFullYear(), 11, 31),
            ),
          ),
        };

      case PaymentReportPeriod.THIS_TERM:
      default:
        return this.getCurrentTermRange();
    }
  }

  private getCurrentTermRange(): DateRange {
    const termName =
      this.config.get<string>('CURRENT_TERM_NAME') ??
      'Summer Term 2026';

    const termStart =
      this.config.get<string>('CURRENT_TERM_START') ??
      '2026-07-04';

    const termEnd =
      this.config.get<string>('CURRENT_TERM_END') ??
      '2026-09-26';

    const from = this.startOfUtcDay(new Date(termStart));
    const to = this.endOfUtcDay(new Date(termEnd));

    if (
      Number.isNaN(from.getTime()) ||
      Number.isNaN(to.getTime()) ||
      from > to
    ) {
      throw new Error(
        'Current term environment variables contain an invalid date range',
      );
    }

    return {
      label: termName,
      from,
      to,
    };
  }

  private startOfUtcWeek(value: Date) {
    const day = value.getUTCDay();

    // In the UK, the reporting week starts on Monday.
    const daysSinceMonday = day === 0 ? 6 : day - 1;

    return new Date(
      Date.UTC(
        value.getUTCFullYear(),
        value.getUTCMonth(),
        value.getUTCDate() - daysSinceMonday,
      ),
    );
  }

  private startOfUtcDay(value: Date) {
    return new Date(
      Date.UTC(
        value.getUTCFullYear(),
        value.getUTCMonth(),
        value.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
  }

  private endOfUtcDay(value: Date) {
    return new Date(
      Date.UTC(
        value.getUTCFullYear(),
        value.getUTCMonth(),
        value.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );
  }

  private formatDateForExport(value: Date | string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('en-GB', {
      timeZone: this.reportTimezone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}