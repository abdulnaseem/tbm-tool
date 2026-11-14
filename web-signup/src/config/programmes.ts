import {
  getSessionFromDob,
} from '../lib/signup-validation';

export type ProgrammeId =
  | 'BRAWLERS_BOXING'
  | 'THE_GRAPPLE_HUB';

export type SignupAccountType =
  | 'GUARDIAN'
  | 'ADULT';

export type ProgrammeConfig = {
  id: ProgrammeId;

  name: string;

  logoSrc: string;

  logoAlt: string;

  discipline:
    | 'BOXING'
    | 'BJJ';

  apiPath: string;

  importSource: string;

  signupTitleLine1: string;

  signupTitleLine2: string;

  signupDescription: string;

  getSession: (
    dateOfBirth: string,
    accountType:
      SignupAccountType,
  ) => string;

  terms: string[];

  success: {
    thankYou: string;
    attendanceMessage?: string;
    closingMessage: string;
  };
};

export const PROGRAMMES:
  Record<
    ProgrammeId,
    ProgrammeConfig
  > = {
  BRAWLERS_BOXING: {
    id:
      'BRAWLERS_BOXING',

    name:
      'Brawlers Boxing',

    logoSrc:
      '/brawlers-boxing.jpeg',

    logoAlt:
      'Brawlers Boxing',

    discipline:
      'BOXING',

    apiPath:
      '/public/signup/brawlers-boxing',

    importSource:
      'BRAWLERS_PUBLIC_SIGNUP',

    signupTitleLine1:
      'Brawlers Boxing',

    signupTitleLine2:
      'Sign Up',

    signupDescription:
      'Complete this form to register yourself or your child for the Brawlers Boxing programme.',

    getSession:
      (dateOfBirth) =>
        getSessionFromDob(
          dateOfBirth,
        ),


        terms: [
          'Brawlers Boxing - Autumn Term 2026. Saturday 10th October 2026 to Saturday 26th December 2026 (12 sessions).',
        
          'Autumn term fee: £100 per child for the 3-month programme.',
        
          'Each child must complete an individual registration form to secure their place. Parents/guardians are responsible for ensuring regular attendance. Refunds are not offered for absences.',
        
          'Saturday Training Timetable:',
        
          'Turtles (Ages 4-7): 12:15pm-1:00pm.',
        
          'Cubs (Ages 8-12): 1:00pm-1:55pm.',
        
          'Tigers (Boys Only, Ages 12-17): 2:00pm-3:00pm.',
          
          'Girls Only (Ages 11-16): 3:00pm-4:00pm.',
        
          'Training venue: Osmani Trust, 58 Underwood Road, London E1 5AW.',
        ],
        

    success: {
      thankYou:
        'Thank you for registering for Brawlers Boxing. Your registration has been received successfully.',

      attendanceMessage:
        "You're welcome to attend our next boxing session this coming Saturday at the Osmani Centre. Our coaching team will be there to welcome you and answer any questions you may have.",

      closingMessage:
        'We look forward to welcoming you to The Butterfly Movement!',
    },
  },

  THE_GRAPPLE_HUB: {
    id:
      'THE_GRAPPLE_HUB',

    name:
      'The Grapple Hub',

    logoSrc:
      '/grapple-hub.jpg',

    logoAlt:
      'The Grapple Hub',

    discipline:
      'BJJ',

    apiPath:
      '/public/signup/the-grapple-hub',

    importSource:
      'GRAPPLE_HUB_PUBLIC_SIGNUP',

    signupTitleLine1:
      'The Grapple Hub',

    signupTitleLine2:
      'Registration',

    signupDescription:
      'Please complete this form so we have up-to-date participant, emergency contact, medical and safeguarding information for the current Youth BJJ cohort.',

    getSession:
      () => 'JUNIORS',

    terms: [
      'The Grapple Hub - Current Youth BJJ Cohort.',

      'This registration is being collected so The Butterfly Movement has accurate participant, parent/guardian, emergency contact, medical and safeguarding information for the current cohort.',

      'Each participant should have an individual registration form completed by their parent or guardian.',

      'Parents and guardians should tell the coaching team if any medical, emergency contact or safeguarding information changes after this form has been submitted.',
    ],

    success: {
      thankYou:
        'Thank you for completing The Grapple Hub registration. Your participant information has been received successfully.',

      attendanceMessage:
        'Your registration will help us keep accurate records for the current Youth BJJ cohort and support the safe delivery of sessions.',

      closingMessage:
        'Thank you for being part of The Grapple Hub and The Butterfly Movement.',
    },
  },
};

export function getProgramme(
  programmeId:
    ProgrammeId,
) {
  return PROGRAMMES[
    programmeId
  ];
}