export interface TournamentTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundImage: string;
}

export const TOURNAMENT_THEMES: Record<string, TournamentTheme> = {
  masters: {
    name: 'The Masters',
    primaryColor: 'rgb(1, 122, 55)', // Augusta National Green
    secondaryColor: 'rgb(253, 218, 36)', // Masters Gold
    accentColor: 'rgb(255, 255, 255)',
    backgroundImage: 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=80&w=2670',
  },
  rbc_heritage: {
    name: 'RBC Heritage',
    primaryColor: 'rgb(0, 40, 85)', // RBC Blue
    secondaryColor: 'rgb(255, 205, 0)', // Heritage Gold
    accentColor: 'rgb(255, 255, 255)',
    backgroundImage: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=2670',
  },
  pga: {
    name: 'PGA Championship',
    primaryColor: 'rgb(0, 32, 91)', // PGA Blue
    secondaryColor: 'rgb(190, 26, 14)', // PGA Red
    accentColor: 'rgb(255, 255, 255)',
    backgroundImage: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=2670',
  },
  us_open: {
    name: 'US Open',
    primaryColor: 'rgb(0, 42, 92)', // USGA Blue
    secondaryColor: 'rgb(207, 20, 43)', // USGA Red
    accentColor: 'rgb(255, 255, 255)',
    backgroundImage: 'https://images.unsplash.com/photo-1535132011086-b8818f016104?auto=format&fit=crop&q=80&w=2670',
  },
  the_open: {
    name: 'The Open Championship',
    primaryColor: 'rgb(0, 87, 184)', // R&A Blue
    secondaryColor: 'rgb(255, 205, 0)', // Championship Gold
    accentColor: 'rgb(255, 255, 255)',
    backgroundImage: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=2670',
  },
};