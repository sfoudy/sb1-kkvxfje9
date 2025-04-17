import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useSWR from 'swr';

interface Player {
  id: string;
  name: string;
  world_ranking: number;
  current_score?: string;
  missed_cut?: boolean;
}

interface Props {
  competitionId: string;
  majorType: string;
  startDate: string;
  onClose: () => void;
  onSuccess: () => void;
}

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch players');
  return response.json();
};

export default function AddParticipantModal({ competitionId, majorType, startDate, onClose, onSuccess }: Props) {
  const [username, setUsername] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isDataAvailable = () => {
    const startDateTime = new Date(startDate);
    const oneWeekBefore = new Date(startDateTime.getTime() - 7 * 24 * 60 * 60 * 1000);
    return new Date() >= oneWeekBefore;
  };

  const { data, error: fetchError } = useSWR(
    isDataAvailable() ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tournament-field?tournament=${majorType}` : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const availablePlayers = data?.players || [];

  // Filter players based on search term
  const filteredPlayers = availablePlayers.filter((player: Player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlayers.length !== 4) {
      setError('Please select exactly 4 players');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create participant
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .insert({
          competition_id: competitionId,
          user_id: user.id,
          username,
        })
        .select()
        .single();

      if (participantError) throw participantError;

      // Create player selections
      const playerSelections = selectedPlayers.map(player => ({
        participant_id: participant.id,
        player_name: player.name,
      }));

      const { error: selectionsError } = await supabase
        .from('player_selections')
        .insert(playerSelections);

      if (selectionsError) throw selectionsError;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add participant');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayers(prev => {
      if (prev.find(p => p.name === player.name)) {
        return prev.filter(p => p.name !== player.name);
      }
      if (prev.length < 4) {
        return [...prev, player];
      }
      return prev;
    });
  };

  if (fetchError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-red-600">Failed to load players. Please try again later.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Participant</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Players
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search players..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
              disabled={!isDataAvailable()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selected Players ({selectedPlayers.length}/4)
            </label>
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedPlayers.map((player) => (
                <span
                  key={player.name}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    player.missed_cut ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {player.name}
                  {player.current_score && ` (${player.current_score})`}
                  {player.missed_cut && ' (Cut)'}
                  <button
                    type="button"
                    onClick={() => handlePlayerSelect(player)}
                    className="ml-1 text-green-600 hover:text-green-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>

            {!isDataAvailable() ? (
              <div className="p-4 bg-gray-100 rounded-md text-gray-600 text-center">
                Player data not currently available.
                <br />
                Check back 1 week before the tournament starts.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md">
                {filteredPlayers.map((player: Player) => (
                  <label
                    key={player.name}
                    className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayers.some(p => p.name === player.name)}
                      onChange={() => handlePlayerSelect(player)}
                      className="mr-2"
                      disabled={!selectedPlayers.some(p => p.name === player.name) && selectedPlayers.length >= 4}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{player.name}</span>
                        <span className={`text-sm ${player.missed_cut ? 'text-red-600' : 'text-gray-500'}`}>
                          {player.current_score}
                          {player.missed_cut && ' (Cut)'}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || selectedPlayers.length !== 4}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Participant'}
          </button>
        </form>
      </div>
    </div>
  );
}