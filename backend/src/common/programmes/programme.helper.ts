// backend/src/common/programmes/programme.helper.ts

import { BadRequestException } from '@nestjs/common';
import { ProgrammeId } from '../enums/programme-id.enum';

export function parseProgrammeId(value?: string): ProgrammeId {
  if (!value) {
    throw new BadRequestException('programmeId is required');
  }

  if (!Object.values(ProgrammeId).includes(value as ProgrammeId)) {
    throw new BadRequestException('Invalid programmeId');
  }

  return value as ProgrammeId;
}