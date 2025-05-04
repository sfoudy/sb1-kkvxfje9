const CACHE_TTL = 30000;
let lastFetchTime = 0;
let cachedData = [];

function safeParseScore(score) {
  if (!score || score === 'E') return 0;
  const parsed = parseInt(score, 10);
  return isNaN(parsed) ? 0 : parsed;
}

async function fetchTournamentData(url) {
  if (Date.now() - lastFetchTime < CACHE_TTL && cachedData.length > 0) {
    return cachedData;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();
    if (!data || !data.events) throw new Error('Invalid data structure');

    const players = [];
    for (const event of data.events) {
      if (!event.competitions) continue;
      for (const competition of event.competitions) {
        if (!competition.competitors) continue;
        for (const player of competition.competitors) {
          try {
            const displayName = player.athlete && player.athlete.displayName ? player.athlete.displayName : 'Unknown';
            const normalizedName = displayName.toLowerCase().trim();
            const currentScore = player.score !== undefined && player.score !== null ? player.score.toString().trim() : 'E';

            players.push({
              id: normalizedName.replace(/\s+/g, '_'),
              name: displayName,
              position: player.status && player.status.position && player.status.position.displayValue ? player.status.position.displayValue : 'N/A',
              current_score: currentScore,
              today: Array.isArray(player.linescores) && player.linescores.length > 0 && player.linescores[0].value ? player.linescores[0].value : 'E',
              thru: player.status && player.status.thru ? player.status.thru : '',
              world_ranking: Array.isArray(player.statistics) ? ((player.statistics.find(function (s) { return s.name === 'world_ranking'; }) || {}).value || 0) : 0
            });
          } catch (playerError) {
            console.error('Error processing player:', playerError);
          }
        }
      }
    }

    players.sort((a, b) => {
      const scoreA = safeParseScore(a.current_score);
      const scoreB = safeParseScore(b.current_score);
      return scoreA - scoreB;
    });

    lastFetchTime = Date.now();
    cachedData = players;

    return players;
  } catch (error) {
    console.error('Fetch error:', error);
    if (cachedData.length > 0) return cachedData;
    return [];
  }
}
