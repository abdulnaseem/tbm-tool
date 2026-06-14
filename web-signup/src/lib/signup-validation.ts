export function isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  
  export function isRequired(value?: string | null) {
    return Boolean(value && value.trim().length > 0);
  }
  
  export function calculateAge(dateOfBirth: string) {
    const dob = new Date(dateOfBirth);
    const today = new Date();
  
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
  
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }
  
    return age;
  }
  
  export function getSessionFromDob(dateOfBirth: string) {
    const age = calculateAge(dateOfBirth);
  
    if (age >= 5 && age <= 10) return 'CUBS';
    if (age >= 11 && age <= 17) return 'TIGERS';
  
    return 'UNKNOWN';
  }