// web-admin/src/types/programme.ts

export type ProgrammeId =
  | 'BRAWLERS_BOXING'
  | 'THE_GRAPPLE_HUB';

export type Programme = {
  id: ProgrammeId;
  name: string;
  shortName: string;
  description: string;
  logo: string;
};

export const PROGRAMMES: Programme[] = [
  {
    id: 'BRAWLERS_BOXING',
    name: 'Brawlers Boxing',
    shortName: 'Brawlers',
    description: 'Boxing programme',
    logo: '/logo2.jpeg',
  },
  {
    id: 'THE_GRAPPLE_HUB',
    name: 'The Grapple Hub',
    shortName: 'Grappling',
    description: 'Brazilian Jiu-Jitsu programme',
    logo: '/grapple-hub-logo.jpeg',
  },
];