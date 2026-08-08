// web-admin/src/lib/programmeApi.ts

import { ProgrammeId } from '../types/programme';

export function withProgramme(
  path: string,
  programmeId: ProgrammeId,
) {
  const separator = path.includes('?') ? '&' : '?';

  return `${path}${separator}programmeId=${encodeURIComponent(
    programmeId,
  )}`;
}