// backend/src/attendance/attendance.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
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

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,

    @InjectModel(MemberProfile.name)
    private memberModel: Model<MemberProfileDocument>,
  ) {}

  private getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  private getSessionTimes(session: AttendanceSession) {
    if (session === 'CUBS') {
      return {
        startHour: 12,
        startMinute: 30,
        endHour: 13,
        endMinute: 45,
      };
    }

    return {
      startHour: 13,
      startMinute: 45,
      endHour: 15,
      endMinute: 0,
    };
  }

  isRegisterOpen(session: AttendanceSession) {
    const now = new Date();

    const isSaturday = now.getDay() === 6;

    if (!isSaturday) {
      return {
        open: false,
        reason: 'Register only opens on Saturdays.',
      };
    }

    const times = this.getSessionTimes(session);

    const minutesNow = now.getHours() * 60 + now.getMinutes();

    const startMinutes = times.startHour * 60 + times.startMinute;
    const endMinutes = times.endHour * 60 + times.endMinute;

    const registerOpenMinutes = startMinutes - 10;

    const open = minutesNow >= registerOpenMinutes && minutesNow <= endMinutes;

    return {
      open,
      reason: open
        ? 'Register is open.'
        : 'Register opens 10 minutes before the session starts.',
    };
  }

  async getRegister(session: AttendanceSession) {
    const date = this.getTodayDateString();
    const register = this.isRegisterOpen(session);

    const members = await this.memberModel
      .find({ session })
      .sort({ childFirstName: 1, childLastName: 1 })
      .lean();

    const attendance = await this.attendanceModel
      .find({ session, date })
      .lean();

    const attendanceByMemberId = new Map(
      attendance.map((record) => [record.memberId, record]),
    );

    return {
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

        const attendanceRecord = attendanceByMemberId.get(String(member._id));

        return {
          memberId: String(member._id),
          childName,
          session: member.session,
          status: attendanceRecord?.status || null,
          markedAt: attendanceRecord?.markedAt || null,
        };
      }),
    };
  }

  async markAttendance(data: {
    memberId: string;
    session: AttendanceSession;
    status: AttendanceStatus;
    markedBy?: string;
  }) {
    const register = this.isRegisterOpen(data.session);

    if (!register.open) {
      throw new BadRequestException(register.reason);
    }

    const member = await this.memberModel.findById(data.memberId).lean();

    if (!member) {
      throw new BadRequestException('Member not found.');
    }

    const childName = [
      (member as any).childFirstName,
      (member as any).childMiddleName,
      (member as any).childLastName,
    ]
      .filter(Boolean)
      .join(' ');

    const date = this.getTodayDateString();

    const attendance = await this.attendanceModel
      .findOneAndUpdate(
        {
          memberId: data.memberId,
          session: data.session,
          date,
        },
        {
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

    return attendance;
  }

  async findByMember(memberId: string) {
    return this.attendanceModel
      .find({ memberId })
      .sort({ date: -1 })
      .lean();
  }

  async getReport() {
    const records = await this.attendanceModel.find().lean();

    const totalMarked = records.length;
    const totalPresent = records.filter((r) => r.status === 'PRESENT').length;
    const totalAbsent = records.filter((r) => r.status === 'ABSENT').length;

    const attendanceRate =
      totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 0;

    const cubsRecords = records.filter((r) => r.session === 'CUBS');
    const tigersRecords = records.filter((r) => r.session === 'TIGERS');

    const getRate = (sessionRecords: any[]) => {
      if (sessionRecords.length === 0) return 0;

      const present = sessionRecords.filter(
        (record) => record.status === 'PRESENT',
      ).length;

      return Math.round((present / sessionRecords.length) * 100);
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

      if (record.status === 'PRESENT') existing.present += 1;
      if (record.status === 'ABSENT') existing.absent += 1;

      existing.rate =
        existing.total > 0
          ? Math.round((existing.present / existing.total) * 100)
          : 0;

      byMember.set(record.memberId, existing);
    }

    const members = Array.from(byMember.values());

    return {
      totalMarked,
      totalPresent,
      totalAbsent,
      attendanceRate,
      cubsAttendanceRate: getRate(cubsRecords),
      tigersAttendanceRate: getRate(tigersRecords),
      mostRegular: members
        .filter((member) => member.total >= 2)
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 5),
      lowAttendance: members
        .filter((member) => member.total >= 2 && member.rate < 60)
        .sort((a, b) => a.rate - b.rate)
        .slice(0, 5),
    };
  }

  async backfillSessionAttendance(data: {
    session: AttendanceSession;
    date: string; // YYYY-MM-DD
    presentNames: string[];
    markedAt: string; // ISO string
    markedBy?: string;
  }) {
    const members = await this.memberModel.find({ session: data.session }).lean();
  
    const presentNamesNormalized = data.presentNames.map((name) =>
      name.trim().toLowerCase(),
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
        memberId: String(member._id),
        session: data.session,
        date: data.date,
      });
  
      // Keep existing PRESENT records unchanged
      if (existing?.status === 'PRESENT') {
        results.push(existing);
        continue;
      }
  
      const isNamedPresent = presentNamesNormalized.some((name) =>
        childName.toLowerCase().includes(name),
      );
  
      const attendance = await this.attendanceModel
        .findOneAndUpdate(
          {
            memberId: String(member._id),
            session: data.session,
            date: data.date,
          },
          {
            memberId: String(member._id),
            childName,
            session: data.session,
            date: data.date,
            status: isNamedPresent ? 'PRESENT' : 'ABSENT',
            markedAt: isNamedPresent
              ? new Date(data.markedAt)
              : new Date(),
            markedBy: data.markedBy || 'ADMIN_BACKFILL',
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
      session: data.session,
      date: data.date,
      totalUpdated: results.length,
      presentNames: data.presentNames,
    };
  }
}