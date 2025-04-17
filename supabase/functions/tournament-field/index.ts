async function fetchTournamentData(url: string): Promise<any[]> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 2000;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; GolfApp/1.0)'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Log the error and throw to trigger retry
        const errorText = await response.text();
        console.error(`HTTP error: ${response.status} - ${errorText}`);
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.events) {
        // Log the error and throw to trigger retry
        console.error('Invalid data structure:', data);
        throw new Error('Invalid data structure');
      }

      const players: any[] = [];
      for (const event of data.events) {
        for (const competition of event.competitions || []) {
          for (const player of competition.competitors || []) {
            try {
              const displayName = player.athlete.displayName;
              const normalizedName = displayName.toLowerCase().trim();
              const currentScore = (player.score || 'E').toString().trim();

              players.push({
                id: normalizedName.replace(/\s+/g, '_'),
                name: displayName,
                position: player.status?.position?.displayValue || 'N/A',
                current_score: currentScore,
                today: player.linescores?.[0]?.value || 'E',
                thru: player.status?.thru || '',
                world_ranking: player.statistics?.find((s: any) => s.name === 'world_ranking')?.value || 0
              });
            } catch (playerError) {
              console.error('Error processing player:', playerError);
            }
          }
        }
      }

      // Sort players by score
      players.sort((a, b) => {
        const scoreA = a.current_score === 'E' ? 0 : parseInt(a.current_score);
        const scoreB = b.current_score === 'E' ? 0 : parseInt(b.current_score);
        return scoreA - scoreB;
      });

      // Success! Return the processed player list
      return players;
    } catch (error) {
      attempt++;
      console.error(`Fetch attempt ${attempt} failed:`, error);

      if (attempt < MAX_RETRIES) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        // All retries failed, log and return last known good data or empty array
        console.error('All fetch attempts failed. Returning empty player list.');
        return []; // Or you could return cached data if you have it
      }
    }
  }
  // Fallback, should never reach here
  return [];
}
