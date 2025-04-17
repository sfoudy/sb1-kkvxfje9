import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Trophy, Users, Calendar, Award, UserPlus, Edit2, Trash2, X, Share2, Copy, Lock, Archive } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TOURNAMENT_THEMES } from '../lib/themes';
import AddParticipantModal from '../components/AddParticipantModal';
import EditParticipantModal from '../components/EditParticipantModal';
import ShareModal from '../components/ShareModal';
import DeleteModal from '../components/DeleteModal';
import BackButton from '../components/BackButton';
import useSWR from 'swr';

interface Player {
  id: string;
  name: string;
  world_ranking: number;
  current_score?: string;
  missed_cut?: boolean;
}

interface PlayerSelection {
  id: string;
  player_name: string;
  current_score: number;
  missed_cut: boolean;
}

interface Participant {
  id: string;
  username: string;
  total_score: number;
  penalty_score: number;
  player_selections: PlayerSelection[];
}

interface Competition {
  id: string;
  title: string;
  major_type: string;
  start_date: string;
  end_date: string;
  access_code: string;
  participants: Participant[];
  created_by: string;
}

const fetcher = async (url: string) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data) throw new Error('No data received');
    
    return {
      players: data.players || [],
      error: data.error
    };
  } catch (error) {
    console.error('Fetcher error:', error);
    return { 
      players: [],
      error: error instanceof Error ? error.message : 'Failed to fetch tournament data'
    };
  }
};

const parseScore = (score: string | undefined): number => {
  if (!score || score === '') return 0;
  if (score === 'E') return 0;
  
  // Handle negative scores (e.g., "-4")
  if (score.startsWith('-')) {
    return -parseInt(score.substring(1));
  }
  
  // Handle positive scores (e.g., "+4" or "4")
  return parseInt(score.replace('+', ''));
};

const formatScore = (score: number): string => {
  if (score === 0) return 'E';
  return score > 0 ? `+${score}` : `${score}`;
};

const getScoreColor = (score: number): string => {
  // For even par
  if (score === 0) return 'bg-gray-50';
  
  // For scores better than -20 or worse than +20
  if (score <= -20) return 'bg-green-100';
  if (score >= 20) return 'bg-red-100';
  
  // For negative scores (good)
  if (score < 0) {
    const intensity = Math.floor((-score / 20) * 3) * 100;
    const level = Math.min(Math.max(intensity, 50), 200);
    return `bg-green-${level}`;
  }
  
  // For positive scores (bad)
  const intensity = Math.floor((score / 20) * 3) * 100;
  const level = Math.min(Math.max(intensity, 50), 200);
  return `bg-red-${level}`;
};

export default function Competition() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get('mode') === 'view';
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [deletingParticipant, setDeletingParticipant] = useState<Participant | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [isCompetitionLocked, setIsCompetitionLocked] = useState(false);

  const fetchCompetitionDetails = async () => {
    try {
      if (!id) throw new Error('Competition ID is required');

      const { data, error: fetchError } = await supabase
        .from('competitions')
        .select(`
          *,
          participants (
            id,
            username,
            total_score,
            penalty_score,
            player_selections (
              id,
              player_name,
              current_score,
              missed_cut
            )
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Competition not found');

      const startDate = new Date(data.start_date);
      const now = new Date();
      setIsCompetitionLocked(now >= startDate);

      setCompetition(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch competition details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitionDetails();
  }, [id]);

  const { data: tournamentData } = useSWR(
    competition ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tournament-field?tournament=${competition.major_type}` : null,
    fetcher,
    { 
      refreshInterval: 30000,
      shouldRetryOnError: true,
      errorRetryCount: 3
    }
  );

  const getPlayerLiveData = (playerName: string) => {
    if (!tournamentData?.players) return null;
    return tournamentData.players.find((p: any) => p.name === playerName);
  };

  const calculateTotalScore = (participant: Participant) => {
    let totalScore = 0;
    
    participant.player_selections.forEach(selection => {
      const liveData = getPlayerLiveData(selection.player_name);
      if (liveData) {
        const playerScore = parseScore(liveData.current_score);
        totalScore += playerScore;
        
        if (liveData.missed_cut) {
          totalScore += 10; // Add penalty for missed cut
        }
      }
    });

    return totalScore;
  };

  const canArchive = (competition: Competition) => {
    const endDate = new Date(competition.end_date);
    const now = new Date();
    return now > endDate;
  };

  const handleDeleteParticipant = async (participant: Participant) => {
    try {
      const { error: deleteError } = await supabase
        .from('participants')
        .delete()
        .eq('id', participant.id);

      if (deleteError) throw deleteError;

      await fetchCompetitionDetails();
      setDeletingParticipant(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete participant');
    }
  };

  const handleArchiveCompetition = async () => {
    if (!competition) return;
    
    setArchiving(true);
    try {
      const sortedParticipants = [...competition.participants].sort((a, b) => 
        calculateTotalScore(a) - calculateTotalScore(b)
      );

      const { data: archivedComp, error: archiveError } = await supabase
        .from('archived_competitions')
        .insert({
          original_id: competition.id,
          title: competition.title,
          major_type: competition.major_type,
          start_date: competition.start_date,
          end_date: competition.end_date,
          created_by: competition.created_by
        })
        .select()
        .single();

      if (archiveError) throw archiveError;

      for (let i = 0; i < sortedParticipants.length; i++) {
        const participant = sortedParticipants[i];
        const { data: archivedParticipant, error: participantError } = await supabase
          .from('archived_participants')
          .insert({
            archived_competition_id: archivedComp.id,
            original_id: participant.id,
            username: participant.username,
            final_score: calculateTotalScore(participant),
            final_position: i + 1
          })
          .select()
          .single();

        if (participantError) throw participantError;

        const playerSelections = participant.player_selections.map(selection => ({
          archived_participant_id: archivedParticipant.id,
          player_name: selection.player_name,
          final_score: selection.current_score,
          missed_cut: selection.missed_cut
        }));

        const { error: selectionsError } = await supabase
          .from('archived_player_selections')
          .insert(playerSelections);

        if (selectionsError) throw selectionsError;
      }

      setShowArchiveModal(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error archiving competition:', error);
      setError('Failed to archive competition');
    } finally {
      setArchiving(false);
    }
  };

  const theme = competition ? TOURNAMENT_THEMES[competition.major_type] : TOURNAMENT_THEMES['masters'];

  const sortedParticipants = competition?.participants.sort((a, b) => 
    calculateTotalScore(a) - calculateTotalScore(b)
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              {error || 'Competition not found'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("${theme.backgroundImage}")`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 p-8">
          <BackButton to="/dashboard" />
        </div>
        <div className="bg-white bg-opacity-95 rounded-lg shadow-lg overflow-hidden backdrop-blur-sm m-8">
          <div className="px-6 py-8 sm:px-8" style={{ backgroundColor: theme.primaryColor }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Trophy className="h-12 w-12 text-white" />
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-white">{competition.title}</h1>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-800 mt-2">
                    {theme.name}
                  </span>
                </div>
              </div>
              <div className="text-right text-white">
                <div className="flex items-center justify-end space-x-4">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {new Date(competition.start_date).toLocaleDateString()} - {new Date(competition.end_date).toLocaleDateString()}
                  </span>
                </div>
                {!isViewMode && (
                  <div className="mt-2 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-white rounded-md text-sm font-medium text-white hover:bg-white hover:text-gray-800 transition-colors"
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Share Competition
                    </button>
                  </div>
                )}
                {isCompetitionLocked && (
                  <div className="mt-2 flex items-center justify-end text-yellow-100">
                    <Lock className="h-4 w-4 mr-1" />
                    <span className="text-sm">Competition has started - No more changes allowed</span>
                  </div>
                )}
                {!isViewMode && canArchive(competition) && (
                  <button
                    onClick={() => setShowArchiveModal(true)}
                    className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Archive className="h-5 w-5 mr-2" />
                    Archive Competition
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2 text-green-600" />
                Leaderboard
              </h2>
              {!isViewMode && !isCompetitionLocked && (
                <button
                  onClick={() => setShowAddParticipant(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add Participant
                </button>
              )}
            </div>

            {tournamentData?.error && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-md">
                <p className="text-yellow-700 text-sm">
                  Note: Live tournament data is temporarily unavailable. Scores may not be up to date.
                </p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Players
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Score
                    </th>
                    {!isViewMode && !isCompetitionLocked && (
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedParticipants.map((participant, index) => {
                    const totalScore = calculateTotalScore(participant);
                    const rowColorClass = getScoreColor(totalScore);
                    
                    return (
                      <tr key={participant.id} className={`${rowColorClass} transition-colors duration-200`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index === 0 && <Award className="h-5 w-5 text-green-600 inline-block mr-1" />}
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {participant.username}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex flex-wrap gap-2">
                            {participant.player_selections.map(selection => {
                              const liveData = getPlayerLiveData(selection.player_name);
                              return (
                                <span
                                  key={selection.id}
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    liveData?.missed_cut
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {selection.player_name}
                                  {liveData && (
                                    <span className="ml-1">
                                      ({liveData.current_score}
                                      {liveData.missed_cut ? ' +10' : ''})
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                          {formatScore(totalScore)}
                        </td>
                        {!isViewMode && !isCompetitionLocked && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setEditingParticipant(participant)}
                                className="text-green-600 hover:text-green-900"
                                title="Edit participant"
                              >
                                <Edit2 className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => setDeletingParticipant(participant)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete participant"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showAddParticipant && !isCompetitionLocked && !isViewMode && (
        <AddParticipantModal
          competitionId={competition.id}
          majorType={competition.major_type}
          startDate={competition.start_date}
          onClose={() => setShowAddParticipant(false)}
          onSuccess={fetchCompetitionDetails}
        />
      )}

      {editingParticipant && !isCompetitionLocked && !isViewMode && (
        <EditParticipantModal
          competitionId={competition.id}
          majorType={competition.major_type}
          participant={editingParticipant}
          onClose={() => setEditingParticipant(null)}
          onSuccess={fetchCompetitionDetails}
        />
      )}

      {deletingParticipant && !isCompetitionLocked && !isViewMode && (
        <DeleteModal
          participant={deletingParticipant}
          onConfirm={() => handleDeleteParticipant(deletingParticipant)}
          onCancel={() => setDeletingParticipant(null)}
        />
      )}

      {showShareModal && (
        <ShareModal
          competitionId={competition.id}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showArchiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Archive Competition</h2>
              <button onClick={() => setShowArchiveModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to archive this competition? This will:
              <ul className="list-disc list-inside mt-2">
                <li>Save the final standings</li>
                <li>Move the competition to the archive</li>
                <li>Remove it from active competitions</li>
              </ul>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowArchiveModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={archiving}
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveCompetition}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={archiving}
              >
                {archiving ? 'Archiving...' : 'Archive Competition'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}