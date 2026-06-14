//backend/src/members/members.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  MemberProfile,
  MemberProfileDocument,
} from './schemas/member-profile.schema';
import { PaymentsService } from 'src/payments/payments.service';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(MemberProfile.name)
    private memberModel: Model<MemberProfileDocument>,

    private paymentsService: PaymentsService,
  ) {}

  async findAll() {
    const members = await this.memberModel.find().sort({ createdAt: -1 }).lean();
  
    return Promise.all(
      members.map(async (member: any) => {
        const hasActivePayment = await this.paymentsService.hasActivePayment(
          String(member._id),
        );
  
        return {
          ...member,
          membershipStatus: hasActivePayment ? 'ACTIVE' : 'EXPIRED',
        };
      }),
    );
  }

  async findOne(id: string) {
    const member = await this.memberModel.findById(id).lean();

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async create(data: any) {
    const dob = data.childDateOfBirth
      ? new Date(data.childDateOfBirth)
      : new Date();
  
    const member = await this.memberModel.create({
      firstName: data.childFirstName || 'Unknown',
      middleName: data.childMiddleName || '',
      lastName: data.childLastName || 'Unknown',
      gender: data.childsGender || '',
      dateOfBirth: dob,
      isMinor: true,
      gymId: 'BRAWLERS_BOXING',
  
      accountType: data.accountType || 'GUARDIAN',
  
      guardianFirstName: data.guardianFirstName || '',
      guardianMiddleName: data.guardianMiddleName || '',
      guardianLastName: data.guardianLastName || '',
      email: data.email || '',
      relationship: data.relationship || 'Guardian',
  
      childFirstName: data.childFirstName || '',
      childMiddleName: data.childMiddleName || '',
      childLastName: data.childLastName || '',
      childsGender: data.childsGender || '',
      childDateOfBirth: dob,
  
      session: data.session || 'UNKNOWN',
      sessionGroup: data.session || 'UNKNOWN',
  
      disciplines: data.disciplines?.length ? data.disciplines : ['BOXING'],
      membershipStatus: 'ACTIVE',
  
      allergies: data.allergies || '',
      medicalConditions: data.medicalConditions || '',
      medications: data.medications || '',
      safeguardingNotes: data.safeguardingNotes || '',
  
      emergencyContactName: data.emergencyContactName || '',
      emergencyContactPhone: data.emergencyContactPhone || '',
  
      consentSafeguarding: data.consentSafeguarding ?? true,
      consentData: data.consentData ?? true,
      consentPhotography: data.consentPhotography ?? false,
  
      totalPrice: Number(data.totalPrice || 100),
      paymentIntentId: data.paymentIntentId || 'MANUAL_ADMIN_CREATE',
  
      importSource: 'MANUAL_ADMIN_CREATE',
    });
  
    return member.toObject();
  }

  async delete(id: string) {
    const member = await this.memberModel.findByIdAndDelete(id).lean();
  
    if (!member) {
      throw new NotFoundException('Member not found');
    }
  
    return { success: true };
  }

  async update(id: string, data: any) {
    const dob = data.childDateOfBirth
      ? new Date(data.childDateOfBirth)
      : undefined;
  
    const updateData: any = {
      accountType: data.accountType || 'GUARDIAN',
  
      guardianFirstName: data.guardianFirstName || '',
      guardianMiddleName: data.guardianMiddleName || '',
      guardianLastName: data.guardianLastName || '',
      email: data.email || '',
      relationship: data.relationship || 'Guardian',
  
      childFirstName: data.childFirstName || '',
      childMiddleName: data.childMiddleName || '',
      childLastName: data.childLastName || '',
      childsGender: data.childsGender || '',
  
      session: data.session || 'UNKNOWN',
  
      disciplines: data.disciplines?.length ? data.disciplines : ['BOXING'],
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
  
      totalPrice: Number(data.totalPrice || 100),
      paymentIntentId: data.paymentIntentId || 'MANUAL_ADMIN_UPDATE',
  
      gymId: 'BRAWLERS_BOXING',
    };
  
    if (dob) {
      updateData.childDateOfBirth = dob;
    }
  
    const member = await this.memberModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .lean();
  
    if (!member) {
      throw new NotFoundException('Member not found');
    }
  
    return member;
  }
}