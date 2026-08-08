// backend/src/attendance/attendance.service.ts

import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Attendance,
  AttendanceDocument,
  AttendanceSession,
  AttendanceStatus,
} from './schemas/attendance.schema';

import {
  MemberProfile,
  MemberProfileDocument,
} from '../members/schemas/member-profile.schema';

import { ProgrammeId } from '../common/enums/programme-id.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<AttendanceDocument>,

    @InjectModel(MemberProfile.name)
    private readonly memberModel: Model<MemberProfileDocument>,
  ) {}

  private getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  private getSessionTimes(
    session: AttendanceSession,
    programmeId: ProgrammeId,
  ) {
    if (programmeId === ProgrammeId.THE_GRAPPLE_HUB) {
      return {
        startHour: 10,
        startMinute: 0,
        endHour: 12,
        endMinute: 0,
      };
    }

    if (session === 'CUBS') {
      return {
        startHour: 12,
        startMinute: 45,
        endHour: 13,
        endMinute: 45,
      };
    }

    return {
      startHour: 13,
      startMinute: 45,
      endHour: 14,
      endMinute: 45,
    };
  }

  isRegisterOpen(
    session: AttendanceSession,
    programmeId: ProgrammeId,
  ) {
    const now = new Date();

    if (now.getDay() !== 6) {
      return {
        open: false,
        reason: 'Register only opens on Saturdays.',
      };
    }

    const times = this.getSessionTimes(session, programmeId);

    const minutesNow =
      now.getHours() * 60 + now.getMinutes();

    const startMinutes =
      times.startHour * 60 + times.startMinute;

    const endMinutes =
      times.endHour * 60 + times.endMinute;

    const open =
      minutesNow >= startMinutes - 10 &&
      minutesNow <= endMinutes;

    return {
      open,
      reason: open
        ? 'Register is open.'
        : 'Register opens 10 minutes before the session starts.',
    };
  }

  async getRegister(
    session: AttendanceSession,
    programmeId: ProgrammeId,
  ) {
    const date = this.getTodayDateString();
    const register = this.isRegisterOpen(
      session,
      programmeId,
    );

    const members = await this.memberModel
      .find({
        gymId: programmeId,
        session,
      })
      .sort({
        childFirstName: 1,
        childLastName: 1,
      })
      .lean();

    const attendance = await this.attendanceModel
      .find({
        gymId: programmeId,
        session,
        date,
      })
      .lean();

    const attendanceByMemberId = new Map(
      attendance.map((record) => [
        record.memberId,
        record,
      ]),
    );

    return {
      programmeId,
      session,
      date,
      registerOpen: register.open,
      message: register.reason,

      members: members.map((member: any) => {
        const childName = [
          member.childFirstName,
          member.childMiddleName,
          member.childLastName,
        ]
          .filter(Boolean)
          .join(' ');

        const record = attendanceByMemberId.get(
          String(member._id),
        );

        return {
          memberId: String(member._id),
          childName,
          session: member.session,
          status: record?.status || null,
          markedAt: record?.markedAt || null,
        };
      }),
    };
  }

  async markAttendance(data: {
    programmeId: ProgrammeId;
    memberId: string;
    session: AttendanceSession;
    status: AttendanceStatus;
    markedBy?: string;
  }) {
    const register = this.isRegisterOpen(
      data.session,
      data.programmeId,
    );

    if (!register.open) {
      throw new BadRequestException(register.reason);
    }

    const member = await this.memberModel
      .findOne({
        _id: data.memberId,
        gymId: data.programmeId,
      })
      .lean();

    if (!member) {
      throw new BadRequestException(
        'Member not found in the selected programme.',
      );
    }

    const childName = [
      (member as any).childFirstName,
      (member as any).childMiddleName,
      (member as any).childLastName,
    ]
      .filter(Boolean)
      .join(' ');

    const date = this.getTodayDateString();

    return this.attendanceModel
      .findOneAndUpdate(
        {
          gymId: data.programmeId,
          memberId: data.memberId,
          session: data.session,
          date,
        },
        {
          gymId: data.programmeId,
          memberId: data.memberId,
          childName,
          session: data.session,
          date,
          status: data.status,
          markedAt: new Date(),
          markedBy: data.markedBy || 'ADMIN',
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        },
      )
      .lean();
  }

  async findByMember(
    memberId: string,
    programmeId: ProgrammeId,
  ) {
    return this.attendanceModel
      .find({
        gymId: programmeId,
        memberId,
      })
      .sort({ date: -1 })
      .lean();
  }

  async getReport(programmeId: ProgrammeId) {
    const records = await this.attendanceModel
      .find({
        gymId: programmeId,
      })
      .lean();

    const totalMarked = records.length;

    const totalPresent = records.filter(
      (record) => record.status === 'PRESENT',
    ).length;

    const totalAbsent = records.filter(
      (record) => record.status === 'ABSENT',
    ).length;

    const attendanceRate =
      totalMarked > 0
        ? Math.round((totalPresent / totalMarked) * 100)
        : 0;

    const getRate = (session: AttendanceSession) => {
      const sessionRecords = records.filter(
        (record) => record.session === session,
      );

      if (!sessionRecords.length) {
        return 0;
      }

      const present = sessionRecords.filter(
        (record) => record.status === 'PRESENT',
      ).length;

      return Math.round(
        (present / sessionRecords.length) * 100,
      );
    };

    const byMember = new Map<
      string,
      {
        memberId: string;
        childName: string;
        session: string;
        total: number;
        present: number;
        absent: number;
        rate: number;
      }
    >();

    for (const record of records) {
      const existing = byMember.get(record.memberId) || {
        memberId: record.memberId,
        childName: record.childName,
        session: record.session,
        total: 0,
        present: 0,
        absent: 0,
        rate: 0,
      };

      existing.total += 1;

      if (record.status === 'PRESENT') {
        existing.present += 1;
      }

      if (record.status === 'ABSENT') {
        existing.absent += 1;
      }

      existing.rate = Math.round(
        (existing.present / existing.total) * 100,
      );

      byMember.set(record.memberId, existing);
    }

    const members = Array.from(byMember.values());

    return {
      programmeId,
      totalMarked,
      totalPresent,
      totalAbsent,
      attendanceRate,

      cubsAttendanceRate: getRate('CUBS'),
      tigersAttendanceRate: getRate('TIGERS'),
      juniorsAttendanceRate: getRate('JUNIORS'),
      adultsAttendanceRate: getRate('ADULTS'),

      mostRegular: members
        .filter((member) => member.total >= 2)
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 5),

      lowAttendance: members
        .filter(
          (member) =>
            member.total >= 2 &&
            member.rate < 60,
        )
        .sort((a, b) => a.rate - b.rate)
        .slice(0, 5),
    };
  }

  async backfillSessionAttendance(data: {
    programmeId: ProgrammeId;
    session: AttendanceSession;
    date: string;
    presentNames: string[];
    markedAt: string;
    markedBy?: string;
  }) {
    const members = await this.memberModel
      .find({
        gymId: data.programmeId,
        session: data.session,
      })
      .lean();

    const normalisedNames = data.presentNames.map(
      (name) => name.trim().toLowerCase(),
    );

    const results = [];

    for (const member of members as any[]) {
      const childName = [
        member.childFirstName,
        member.childMiddleName,
        member.childLastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

      const existing = await this.attendanceModel.findOne({
        gymId: data.programmeId,
        memberId: String(member._id),
        session: data.session,
        date: data.date,
      });

      if (existing?.status === 'PRESENT') {
        results.push(existing);
        continue;
      }

      const isPresent = normalisedNames.some((name) =>
        childName.toLowerCase().includes(name),
      );

      const attendance = await this.attendanceModel
        .findOneAndUpdate(
          {
            gymId: data.programmeId,
            memberId: String(member._id),
            session: data.session,
            date: data.date,
          },
          {
            gymId: data.programmeId,
            memberId: String(member._id),
            childName,
            session: data.session,
            date: data.date,
            status: isPresent ? 'PRESENT' : 'ABSENT',
            markedAt: isPresent
              ? new Date(data.markedAt)
              : new Date(),
            markedBy:
              data.markedBy || 'ADMIN_BACKFILL',
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
          },
        )
        .lean();

      results.push(attendance);
    }

    return {
      success: true,
      programmeId: data.programmeId,
      session: data.session,
      date: data.date,
      totalUpdated: results.length,
    };
  }
}