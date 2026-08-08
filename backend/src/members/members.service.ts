// backend/src/members/members.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  MemberProfile,
  MemberProfileDocument,
} from './schemas/member-profile.schema';

import { PaymentsService } from '../payments/payments.service';
import { ProgrammeId } from '../common/enums/programme-id.enum';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(MemberProfile.name)
    private readonly memberModel: Model<MemberProfileDocument>,

    private readonly paymentsService: PaymentsService,
  ) {}

  async findAll(programmeId: ProgrammeId) {
    const members = await this.memberModel
      .find({ gymId: programmeId })
      .sort({ createdAt: -1 })
      .lean();

    return Promise.all(
      members.map(async (member: any) => {
        const hasActivePayment =
          await this.paymentsService.hasActivePayment(
            String(member._id),
            programmeId,
          );

        return {
          ...member,
          membershipStatus: hasActivePayment ? 'ACTIVE' : 'EXPIRED',
        };
      }),
    );
  }

  async findOne(id: string, programmeId: ProgrammeId) {
    const member = await this.memberModel
      .findOne({
        _id: id,
        gymId: programmeId,
      })
      .lean();

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async create(data: any) {
    const programmeId =
      data.gymId === ProgrammeId.THE_GRAPPLE_HUB
        ? ProgrammeId.THE_GRAPPLE_HUB
        : ProgrammeId.BRAWLERS_BOXING;

    const dob = data.childDateOfBirth
      ? new Date(data.childDateOfBirth)
      : undefined;

    const defaultDisciplines =
      programmeId === ProgrammeId.THE_GRAPPLE_HUB
        ? ['BJJ']
        : ['BOXING'];

    const defaultPrice =
      programmeId === ProgrammeId.THE_GRAPPLE_HUB ? 0 : 100;

    const member = await this.memberModel.create({
      gymId: programmeId,

      accountType: data.accountType || 'GUARDIAN',

      guardianFirstName: data.guardianFirstName || '',
      guardianMiddleName: data.guardianMiddleName || '',
      guardianLastName: data.guardianLastName || '',
      email: String(data.email || '').trim().toLowerCase(),
      relationship: data.relationship || 'Parent/Guardian',

      childFirstName: data.childFirstName || '',
      childMiddleName: data.childMiddleName || '',
      childLastName: data.childLastName || '',
      childsGender: data.childsGender || '',
      childDateOfBirth: dob,

      session: data.session || 'UNKNOWN',

      disciplines:
        Array.isArray(data.disciplines) && data.disciplines.length
          ? data.disciplines
          : defaultDisciplines,

      membershipStatus: data.membershipStatus || 'ACTIVE',

      allergies: data.allergies || '',
      medicalConditions: data.medicalConditions || '',
      medications: data.medications || '',
      safeguardingNotes: data.safeguardingNotes || '',

      emergencyContactName: data.emergencyContactName || '',
      emergencyContactPhone: data.emergencyContactPhone || '',

      consentSafeguarding: data.consentSafeguarding ?? true,
      consentData: data.consentData ?? true,
      consentPhotography: data.consentPhotography ?? false,

      totalPrice: Number(data.totalPrice ?? defaultPrice),

      paymentIntentId:
        data.paymentIntentId || 'MANUAL_ADMIN_CREATE',

      importSource:
        data.importSource || 'MANUAL_ADMIN_CREATE',
    });

    return member.toObject();
  }

  async update(
    id: string,
    programmeId: ProgrammeId,
    data: any,
  ) {
    const dob = data.childDateOfBirth
      ? new Date(data.childDateOfBirth)
      : undefined;

    const defaultDisciplines =
      programmeId === ProgrammeId.THE_GRAPPLE_HUB
        ? ['BJJ']
        : ['BOXING'];

    const updateData: Record<string, unknown> = {
      accountType: data.accountType || 'GUARDIAN',

      guardianFirstName: data.guardianFirstName || '',
      guardianMiddleName: data.guardianMiddleName || '',
      guardianLastName: data.guardianLastName || '',
      email: String(data.email || '').trim().toLowerCase(),
      relationship: data.relationship || 'Parent/Guardian',

      childFirstName: data.childFirstName || '',
      childMiddleName: data.childMiddleName || '',
      childLastName: data.childLastName || '',
      childsGender: data.childsGender || '',

      session: data.session || 'UNKNOWN',

      disciplines:
        Array.isArray(data.disciplines) && data.disciplines.length
          ? data.disciplines
          : defaultDisciplines,

      allergies: data.allergies || '',
      medicalConditions: data.medicalConditions || '',
      medications: data.medications || '',
      safeguardingNotes: data.safeguardingNotes || '',

      emergencyContactName: data.emergencyContactName || '',
      emergencyContactPhone: data.emergencyContactPhone || '',

      consentSafeguarding: data.consentSafeguarding ?? true,
      consentData: data.consentData ?? true,
      consentPhotography: data.consentPhotography ?? false,

      totalPrice: Number(data.totalPrice ?? 0),

      paymentIntentId:
        data.paymentIntentId || 'MANUAL_ADMIN_UPDATE',
    };

    if (dob) {
      updateData.childDateOfBirth = dob;
    }

    const member = await this.memberModel
      .findOneAndUpdate(
        {
          _id: id,
          gymId: programmeId,
        },
        updateData,
        {
          new: true,
          runValidators: true,
        },
      )
      .lean();

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async delete(id: string, programmeId: ProgrammeId) {
    const member = await this.memberModel
      .findOneAndDelete({
        _id: id,
        gymId: programmeId,
      })
      .lean();

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return { success: true };
  }
}