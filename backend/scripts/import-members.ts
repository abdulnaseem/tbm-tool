// backend/scripts/import-members.ts
import * as dotenv from 'dotenv';
dotenv.config();

import * as XLSX from 'xlsx';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI missing from .env');
}

function splitName(fullName: string) {
  const parts = String(fullName || '').trim().split(/\s+/);

  return {
    firstName: parts[0] || '',
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : '',
  };
}

function cleanYesNo(value: any) {
  const text = String(value || '').toLowerCase();
  return text.includes('yes');
}

function calculateAge(dob: Date) {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

function getSessionFromAge(age: number) {
  if (age >= 5 && age <= 10) return 'CUBS';
  if (age >= 11 && age <= 17) return 'TIGERS';
  return 'UNKNOWN';
}

async function run() {
  await mongoose.connect(MONGODB_URI);

  const workbook = XLSX.readFile('./data/contact-information.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<any>(sheet);

  const imports = [];

  for (const row of rows) {
    const guardianName = splitName(row['Name Of Parent / Guardian']);
    const childName = splitName(row['Name of Child / Participant']);

    const dob = new Date(row['Date of Birth']);
    const age = calculateAge(dob);
    const session = getSessionFromAge(age);

    const record = {
      accountType: 'GUARDIAN',

      guardianFirstName: guardianName.firstName,
      guardianMiddleName: guardianName.middleName,
      guardianLastName: guardianName.lastName,

      email: String(row['Email Address'] || '').trim().toLowerCase(),
      password: await bcrypt.hash('TempPassword123!', 10),

      relationship: row['Relationship'] || 'Guardian',

      childFirstName: childName.firstName,
      childMiddleName: childName.middleName,
      childLastName: childName.lastName,
      childsGender: row['Gender'] || '',
      childDateOfBirth: dob,

      session,
      disciplines: ['BOXING'],

      allergies: row['Does your child have any allergies (e.g., med'] || '',
      medicalConditions: [
        row['Has your child ever been diagnosed with a heart conditic'],
        row['Does your child suffer from Asthma, breathi'],
        row['Does your child have epilepsy, seizures, or al'],
        row['Does your child have diabetes (Type 1 or Typ'],
        row['Does your child have any condition not listed'],
        row['Additional Comments'],
      ]
        .filter(Boolean)
        .join(' | '),

      medications: row['Is your child currently taking any medication'] || '',

      emergencyContactName: String(row['Emergency Contact name & number'] || '').trim(),
      emergencyContactPhone: String(row['Emergency Contact name & number'] || '').trim(),

      safeguardingNotes: row['Additional Comments'] || '',

      consentSafeguarding: true,
      consentData: true,
      consentPhotography: cleanYesNo(row['photography & Video Consent']),

      totalPrice: 100,
      paymentIntentId: 'IMPORTED_FROM_SHEET',
    };

    imports.push(record);
  }

  await mongoose.connection.collection('members').insertMany(imports);

  console.log(`Imported ${imports.length} records`);
  await mongoose.disconnect();
}

run().catch(console.error);