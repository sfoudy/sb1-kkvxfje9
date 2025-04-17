export interface Tournament {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

export const TOURNAMENTS_2025: Record<string, Tournament> = {
  masters: {
    id: 'masters',
    name: 'The Masters',
    startDate: new Date('2025-04-10T00:00:00Z'),
    endDate: new Date('2025-04-13T23:59:59Z')
  },
  rbc_heritage: {
    id: 'rbc_heritage',
    name: 'RBC Heritage',
    startDate: new Date('2025-04-18T00:00:00Z'),
    endDate: new Date('2025-04-21T23:59:59Z')
  },
  pga: {
    id: 'pga',
    name: 'PGA Championship',
    startDate: new Date('2025-05-15T00:00:00Z'),
    endDate: new Date('2025-05-18T23:59:59Z')
  },
  us_open: {
    id: 'us_open',
    name: 'US Open',
    startDate: new Date('2025-06-12T00:00:00Z'),
    endDate: new Date('2025-06-15T23:59:59Z')
  },
  the_open: {
    id: 'the_open',
    name: 'The Open Championship',
    startDate: new Date('2025-07-17T00:00:00Z'),
    endDate: new Date('2025-07-20T23:59:59Z')
  }
};

export function generateAccessCode(): string {
  // Generate a 6-character alphanumeric code
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}