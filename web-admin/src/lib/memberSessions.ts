export const BRAWLERS_SESSIONS = [
    { value: 'TURTLES', label: 'Turtles (4–7)' },
    { value: 'CUBS', label: 'Cubs (8–11)' },
    { value: 'TIGERS', label: 'Tigers – Boys Only (12–17)' },
    { value: 'GIRLS_ONLY', label: 'Girls Only (11–16)' },
    { value: 'UNKNOWN', label: 'Unassigned' },
  ] as const;
  
  export const GRAPPLE_SESSIONS = [
    { value: 'JUNIORS', label: 'Juniors' },
    { value: 'ADULTS', label: 'Adults' },
    { value: 'UNKNOWN', label: 'Unassigned' },
  ] as const;
  
  export function sessionLabel(value?: string) {
    const session = [...BRAWLERS_SESSIONS, ...GRAPPLE_SESSIONS].find(
      (option) => option.value === (value || 'UNKNOWN'),
    );
    return session?.label.replace(/ \(.*\)$/, '') ?? (value || 'UNKNOWN');
  }
  