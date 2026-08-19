import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  BjjYouthBelt,
  MemberProfile,
  MemberProfileDocument,
  ProgrammeId,
} from './schemas/member-profile.schema';

import { PaymentsService } from '../payments/payments.service';
import { AttendanceService } from '../attendance/attendance.service';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(MemberProfile.name)
    private readonly memberModel:
      Model<MemberProfileDocument>,

    private readonly paymentsService:
      PaymentsService,

    private readonly attendanceService:
      AttendanceService,
  ) {}

  async findAll(
    programmeId?: ProgrammeId,
  ) {
    const filter = programmeId
      ? {
          gymId: programmeId,
        }
      : {};

    const members = await this.memberModel
      .find(filter)
      .sort({
        createdAt: -1,
      })
      .lean();

    return Promise.all(
      members.map(async (member: any) => {
        const hasActivePayment =
          await this.paymentsService.hasActivePayment(
            String(member._id),
            member.gymId,
          );

        return {
          ...member,

          membershipStatus:
            hasActivePayment
              ? 'ACTIVE'
              : 'EXPIRED',
        };
      }),
    );
  }

  async findOne(id: string) {
    const member = await this.memberModel
      .findById(id)
      .lean();

    if (!member) {
      throw new NotFoundException(
        'Member not found',
      );
    }

    return member;
  }

  async create(
    data: any,
    programmeId: ProgrammeId =
      'BRAWLERS_BOXING',
  ) {
    const dob = data.childDateOfBirth
      ? new Date(data.childDateOfBirth)
      : undefined;

    const trainingStartDate =
      data.trainingStartDate
        ? new Date(data.trainingStartDate)
        : undefined;

    if (
      dob &&
      Number.isNaN(dob.getTime())
    ) {
      throw new BadRequestException(
        'Invalid date of birth',
      );
    }

    if (
      trainingStartDate &&
      Number.isNaN(
        trainingStartDate.getTime(),
      )
    ) {
      throw new BadRequestException(
        'Invalid BJJ training start date',
      );
    }

    const isGrappleHub =
      programmeId ===
      'THE_GRAPPLE_HUB';

    if (
      isGrappleHub &&
      !trainingStartDate
    ) {
      throw new BadRequestException(
        'BJJ training start date is required',
      );
    }

    const member =
      await this.memberModel.create({
        accountType:
          data.accountType ||
          'GUARDIAN',

        guardianFirstName:
          data.guardianFirstName || '',

        guardianMiddleName:
          data.guardianMiddleName || '',

        guardianLastName:
          data.guardianLastName || '',

        email:
          data.email || '',

        relationship:
          data.relationship ||
          'Guardian',

        phone:
          data.phone || '',

        childFirstName:
          data.childFirstName || '',

        childMiddleName:
          data.childMiddleName || '',

        childLastName:
          data.childLastName || '',

        childsGender:
          data.childsGender || '',

        childDateOfBirth:
          dob,

        gymId:
          programmeId,

        session:
          isGrappleHub
            ? 'JUNIORS'
            : data.session ||
              'UNKNOWN',

        disciplines:
          isGrappleHub
            ? ['BJJ']
            : data.disciplines?.length
              ? data.disciplines
              : ['BOXING'],

        membershipStatus:
          'ACTIVE',

        allergies:
          data.allergies || '',

        medicalConditions:
          data.medicalConditions || '',

        medications:
          data.medications || '',

        safeguardingNotes:
          data.safeguardingNotes || '',

        emergencyContactName:
          data.emergencyContactName || '',

        emergencyContactPhone:
          data.emergencyContactPhone || '',

        consentSafeguarding:
          data.consentSafeguarding ??
          true,

        consentData:
          data.consentData ??
          true,

        consentPhotography:
          data.consentPhotography ??
          false,

        totalPrice:
          Number(
            data.totalPrice || 0,
          ),

        paymentIntentId:
          data.paymentIntentId ||
          'MANUAL_ADMIN_CREATE',

        importSource:
          data.importSource ||
          'MANUAL_ADMIN_CREATE',

        trainingStartDate:
          isGrappleHub
            ? trainingStartDate
            : null,

        bjjBelt:
          isGrappleHub
            ? data.bjjBelt ||
              BjjYouthBelt.WHITE
            : BjjYouthBelt.WHITE,

        bjjStripes:
          isGrappleHub
            ? Number(
                data.bjjStripes || 0,
              )
            : 0,

        lastGradingDate:
          null,

        gradingNotes:
          '',
      });

    return member.toObject();
  }

  async update(
    id: string,
    data: any,
  ) {
    const existing =
      await this.memberModel.findById(
        id,
      );

    if (!existing) {
      throw new NotFoundException(
        'Member not found',
      );
    }

    const dob =
      data.childDateOfBirth
        ? new Date(
            data.childDateOfBirth,
          )
        : undefined;

    const trainingStartDate =
      data.trainingStartDate
        ? new Date(
            data.trainingStartDate,
          )
        : undefined;

    const updateData: any = {
      accountType:
        data.accountType ??
        existing.accountType,

      guardianFirstName:
        data.guardianFirstName ??
        existing.guardianFirstName,

      guardianMiddleName:
        data.guardianMiddleName ??
        existing.guardianMiddleName,

      guardianLastName:
        data.guardianLastName ??
        existing.guardianLastName,

      email:
        data.email ??
        existing.email,

      relationship:
        data.relationship ??
        existing.relationship,

      phone:
        data.phone ??
        existing.phone,

      childFirstName:
        data.childFirstName ??
        existing.childFirstName,

      childMiddleName:
        data.childMiddleName ??
        existing.childMiddleName,

      childLastName:
        data.childLastName ??
        existing.childLastName,

      childsGender:
        data.childsGender ??
        existing.childsGender,

      session:
        data.session ??
        existing.session,

      disciplines:
        data.disciplines?.length
          ? data.disciplines
          : existing.disciplines,

      allergies:
        data.allergies ??
        existing.allergies,

      medicalConditions:
        data.medicalConditions ??
        existing.medicalConditions,

      medications:
        data.medications ??
        existing.medications,

      safeguardingNotes:
        data.safeguardingNotes ??
        existing.safeguardingNotes,

      emergencyContactName:
        data.emergencyContactName ??
        existing.emergencyContactName,

      emergencyContactPhone:
        data.emergencyContactPhone ??
        existing.emergencyContactPhone,

      consentSafeguarding:
        data.consentSafeguarding ??
        existing.consentSafeguarding,

      consentData:
        data.consentData ??
        existing.consentData,

      consentPhotography:
        data.consentPhotography ??
        existing.consentPhotography,

      totalPrice:
        data.totalPrice !== undefined
          ? Number(data.totalPrice)
          : existing.totalPrice,
    };

    if (dob) {
      updateData.childDateOfBirth =
        dob;
    }

    if (
      existing.gymId ===
      'THE_GRAPPLE_HUB'
    ) {
      if (trainingStartDate) {
        updateData.trainingStartDate =
          trainingStartDate;
      }

      if (data.bjjBelt) {
        updateData.bjjBelt =
          data.bjjBelt;
      }

      if (
        data.bjjStripes !==
        undefined
      ) {
        const stripes =
          Number(
            data.bjjStripes,
          );

        if (
          stripes < 0 ||
          stripes > 4
        ) {
          throw new BadRequestException(
            'BJJ stripes must be between 0 and 4',
          );
        }

        updateData.bjjStripes =
          stripes;
      }

      if (
        data.lastGradingDate
      ) {
        updateData.lastGradingDate =
          new Date(
            data.lastGradingDate,
          );
      }

      if (
        data.gradingNotes !==
        undefined
      ) {
        updateData.gradingNotes =
          data.gradingNotes;
      }
    }

    const member =
      await this.memberModel
        .findByIdAndUpdate(
          id,
          updateData,
          {
            new: true,
            runValidators: true,
          },
        )
        .lean();

    if (!member) {
      throw new NotFoundException(
        'Member not found',
      );
    }

    return member;
  }

  async delete(id: string) {
    const member =
      await this.memberModel
        .findByIdAndDelete(id)
        .lean();

    if (!member) {
      throw new NotFoundException(
        'Member not found',
      );
    }

    return {
      success: true,
    };
  }

  async getBjjProgress(
    id: string,
  ) {
    const member =
      await this.memberModel
        .findById(id)
        .lean();

    if (!member) {
      throw new NotFoundException(
        'Member not found',
      );
    }

    if (
      member.gymId !==
      'THE_GRAPPLE_HUB'
    ) {
      throw new BadRequestException(
        'BJJ progression is only available for The Grapple Hub members',
      );
    }

    const attendance =
      await this.attendanceService
        .getMemberAttendanceSummary(
          id,
          'THE_GRAPPLE_HUB',
        );

    return {
      memberId:
        String(member._id),

      childName: [
        member.childFirstName,
        member.childMiddleName,
        member.childLastName,
      ]
        .filter(Boolean)
        .join(' '),

      trainingStartDate:
        member.trainingStartDate ??
        null,

      monthsTraining:
        this.calculateMonthsTraining(
          member.trainingStartDate,
        ),

      currentBelt:
        member.bjjBelt ??
        BjjYouthBelt.WHITE,

      stripes:
        member.bjjStripes ?? 0,

      lastGradingDate:
        member.lastGradingDate ??
        null,

      gradingNotes:
        member.gradingNotes ?? '',

      recordedClasses:
        attendance.present,

      recordedAbsences:
        attendance.absent,

      totalRecordedRegisters:
        attendance.total,

      attendanceRate:
        attendance.rate,

      firstRecordedClass:
        attendance.firstRecordedClass,

      latestRecordedClass:
        attendance.latestRecordedClass,
    };
  }

  private calculateMonthsTraining(
    startDate?: Date | null,
  ) {
    if (!startDate) {
      return 0;
    }

    const start =
      new Date(startDate);

    const today =
      new Date();

    let months =
      (today.getFullYear() -
        start.getFullYear()) *
      12;

    months +=
      today.getMonth() -
      start.getMonth();

    if (
      today.getDate() <
      start.getDate()
    ) {
      months--;
    }

    return Math.max(
      months,
      0,
    );
  }
}