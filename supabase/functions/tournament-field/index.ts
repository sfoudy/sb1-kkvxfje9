import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Tournament URLs and API endpoints with specific tournament IDs
const TOURNAMENT_URLS = {
  masters: 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard/401556393',
  pga: 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard/401556394',
  us_open: 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard/401556395',
  the_open: 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard/401556396',
  rbc_heritage: 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard' // Current tournament
};

// List of players who have missed the cut with their final scores
const MISSED_CUT_PLAYERS = {
  // This will be populated once the tournament starts and players miss the cut
};

function normalizeName(name: string): string {
  return name.toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function parseScore(score: string): number {
  if (!score) return 0;
  if (score === 'E') return 0;
  return parseInt(score.replace('+', '').replace('-', '')) * (score.includes('+') ? 1 : -1);
}

async function fetchTournamentData(url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; GolfApp/1.0)'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    if (!data || !data.events) {
      return [];
    }

    const players: any[] = [];
    for (const event of data.events || []) {
      for (const competition of event.competitions || []) {
        for (const player of competition.competitors || []) {
          try {
            const displayName = player.athlete.displayName;
            const normalizedName = normalizeName(displayName);
            const missedCut = normalizedName in MISSED_CUT_PLAYERS;
            
            const currentScore = missedCut 
              ? MISSED_CUT_PLAYERS[normalizedName]
              : (player.score || 'E').toString().trim();

            players.push({
              id: normalizedName.replace(/\s+/g, '_'),
              name: displayName,
              position: player.status?.position?.displayValue || (missedCut ? 'CUT' : 'N/A'),
              current_score: currentScore,
              today: player.linescores?.[0]?.value || 'E',
              thru: player.status?.thru || '',
              missed_cut: missedCut,
              world_ranking: player.statistics?.find((s: any) => s.name === 'world_ranking')?.value || 0
            });
          } catch (error) {
            console.error('Error processing player:', error);
          }
        }
      }
    }

    return players.sort((a, b) => {
      const scoreA = parseScore(a.current_score);
      const scoreB = parseScore(b.current_score);
      return scoreA - scoreB;
    });
  } catch (error) {
    console.error('Error fetching tournament data:', error);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const tournament = url.searchParams.get('tournament');

    if (!tournament || !TOURNAMENT_URLS[tournament as keyof typeof TOURNAMENT_URLS]) {
      throw new Error('Invalid tournament type');
    }

    const tournamentUrl = TOURNAMENT_URLS[tournament as keyof typeof TOURNAMENT_URLS];
    const players = await fetchTournamentData(tournamentUrl);

    return new Response(
      JSON.stringify({ 
        success: true,
        players: players || [] 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Tournament field function error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to fetch tournament data',
        players: [] 
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});