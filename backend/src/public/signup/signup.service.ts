// backend/src/public/signup/signup.service.ts

import {
    BadRequestException,
    Injectable,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  
  import {
    MemberProfile,
    MemberProfileDocument,
  } from '../../members/schemas/member-profile.schema';
  
  import { AdultSignupDto } from './dto/adult-signup.dto';
  import { GuardianSignupDto } from './dto/guardian-signup.dto';
  
  @Injectable()
  export class SignupService {
    constructor(
      @InjectModel(MemberProfile.name)
      private readonly memberModel: Model<MemberProfileDocument>,
  
      // 🔌 EXTENSION POINTS (add later)
      // private readonly usersService: UsersService,
      // private readonly guardiansService: GuardiansService,
      // private readonly paymentsService: PaymentsService,
    ) {}
  
    /* -------------------------------------------------------------------------- */
    /*                               ADULT SIGNUP                                 */
    /* -------------------------------------------------------------------------- */
  
    async handleAdultSignup(dto: AdultSignupDto) {
      // 1️⃣ Validate age >= 18
      const dob = new Date(dto.dateOfBirth);
      if (!this.isAdult(dob)) {
        throw new BadRequestException('Member must be 18 or older');
      }
  
      // 2️⃣ (Later) verify Stripe payment
      // await this.paymentsService.verifyPayment(dto.paymentIntentId);
  
      // 3️⃣ (Later) create User account
      // const user = await this.usersService.createMemberUser({
      //   email: dto.email,
      //   password: dto.password,
      // });
  
      // 4️⃣ Create MemberProfile
      const member = await this.memberModel.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: dob,
        isMinor: false,
        guardians: [],
        contact: {
          phone: dto.phone,
          email: dto.email,
          address: dto.address,
        },
        emergencyContacts: dto.emergencyContacts,
        disciplines: dto.disciplines,
        membershipStatus: 'ACTIVE',
        gymId: this.getDefaultGymId(),
      });
  
      return {
        success: true,
        memberId: member._id,
      };
    }
  
    /* -------------------------------------------------------------------------- */
    /*                           GUARDIAN + CHILD SIGNUP                          */
    /* -------------------------------------------------------------------------- */
  
    async handleGuardianSignup(dto: GuardianSignupDto) {
      // 1️⃣ Validate child age 5–17
      const childDob = new Date(dto.childDateOfBirth);
      if (!this.isValidChildAge(childDob)) {
        throw new BadRequestException(
          'Child must be between 5 and 17 years old',
        );
      }
  
      // 2️⃣ (Later) verify Stripe payment
      // await this.paymentsService.verifyPayment(dto.paymentIntentId);
  
      // 3️⃣ (Later) create Guardian user + profile
      // const guardianUser = await this.usersService.createGuardianUser(...)
      // const guardianProfile = await this.guardiansService.create(...)
  
      const guardianProfileId = 'TEMP_GUARDIAN_ID'; // placeholder
  
      // 4️⃣ Create child MemberProfile
      const childMember = await this.memberModel.create({
        firstName: dto.childFirstName,
        lastName: dto.childLastName,
        dateOfBirth: childDob,
        isMinor: true,
        guardians: [
          {
            guardianId: guardianProfileId,
            relationship: dto.relationship,
            canViewMedical: true,
            canManagePayments: true,
          },
        ],
        emergencyContacts: dto.emergencyContacts,
        disciplines: dto.disciplines,
        membershipStatus: 'ACTIVE',
        gymId: this.getDefaultGymId(),
      });
  
      return {
        success: true,
        memberId: childMember._id,
      };
    }
  
    /* -------------------------------------------------------------------------- */
    /*                               HELPERS                                      */
    /* -------------------------------------------------------------------------- */
  
    private isAdult(dob: Date): boolean {
      const age = this.calculateAge(dob);
      return age >= 18;
    }
  
    private isValidChildAge(dob: Date): boolean {
      const age = this.calculateAge(dob);
      return age >= 5 && age <= 17;
    }
  
    private calculateAge(dob: Date): number {
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    }
  
    private getDefaultGymId(): string {
      // 🔧 Replace later with real gym resolution logic
      return 'DEFAULT_GYM_ID';
    }
  }  