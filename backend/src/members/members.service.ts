import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  MemberProfile,
  MemberProfileDocument,
} from './schemas/member-profile.schema';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(MemberProfile.name)
    private memberModel: Model<MemberProfileDocument>,
  ) {}

  async findAll() {
    return this.memberModel.find().lean();
  }

  async findOne(id: string) {
    const member = await this.memberModel.findById(id).lean();
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }
}