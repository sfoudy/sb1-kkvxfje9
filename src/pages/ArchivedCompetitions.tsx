import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, Award, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BackButton from '../components/BackButton';

interface ArchivedParticipant {
  id: string;
  username: string;
  final_score: number;
  final_position: number;
  player_selections: {
    id: string;
    player_name: string;
    final_score: number;
    missed_cut: boolean;
  }[];
}

interface ArchivedCompetition {
  id: string;
  title: string;
  major_type: string;
  start_date: string;
  end_date: string;
  archived_at: string;
  participants: ArchivedParticipant[];
}

interface DeleteModalProps {
  competition: ArchivedCompetition;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal = ({ competition, onConfirm, onCancel }: DeleteModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-md w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Delete Archived Competition</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="h-6 w-6" />
        </button>
      </div>
      <p className="text-gray-600 mb-4">
        Are you sure you want to delete the archived record of "{competition.title}"? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Delete Archive
        </button>
      </div>
    </div>
  </div>
);

export default function ArchivedCompetitions() {
  const [competitions, setCompetitions] = useState<ArchivedCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCompetition, setDeletingCompetition] = useState<ArchivedCompetition | null>(null);

  const fetchArchivedCompetitions = async () => {
    try {
      const { data: archivedComps, error: fetchError } = await supabase
        .from('archived_competitions')
        .select(`
          *,
          participants:archived_participants (
            *,
            player_selections:archived_player_selections (*)
          )
        `)
        .order('archived_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCompetitions(archivedComps || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch archived competitions');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchArchivedCompetitions();
  }, []);

  const handleDelete = async (competition: ArchivedCompetition) => {
    try {
      const { error: deleteError } = await supabase
        .from('archived_competitions')
        .delete()
        .eq('id', competition.id);

      if (deleteError) throw deleteError;

      setCompetitions(prevCompetitions => 
        prevCompetitions.filter(c => c.id !== competition.id)
      );
      setDeletingCompetition(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete archived competition');
    }
  };

  const formatScore = (score: number): string => {
    if (score === 0) return 'E';
    return score > 0 ? `+${score}` : `${score}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <BackButton to="/dashboard" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Archived Competitions</h1>

        {competitions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No archived competitions</h3>
            <p className="mt-1 text-sm text-gray-500">
              Completed competitions will appear here once archived.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {competitions.map((competition) => (
              <div key={competition.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-green-600 px-6 py-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center">
                      <Trophy className="h-8 w-8" />
                      <div className="ml-4">
                        <h2 className="text-xl font-semibold">{competition.title}</h2>
                        <div className="flex items-center mt-1 text-green-100">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {new Date(competition.start_date).toLocaleDateString()} - {new Date(competition.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-green-100">
                        Archived on {new Date(competition.archived_at).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => setDeletingCompetition(competition)}
                        className="text-white hover:text-red-200 transition-colors"
                        title="Delete archive"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <table className="min-w-full">
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
                          Final Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {competition.participants
                        .sort((a, b) => a.final_position - b.final_position)
                        .map((participant) => (
                          <tr key={participant.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {participant.final_position === 1 && (
                                <Award className="h-5 w-5 text-green-600 inline-block mr-1" />
                              )}
                              {participant.final_position}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {participant.username}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div className="flex flex-wrap gap-2">
                                {participant.player_selections.map((selection) => (
                                  <span
                                    key={selection.id}
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      selection.missed_cut
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {selection.player_name}
                                    {selection.final_score !== null && (
                                      <span className="ml-1">
                                        ({formatScore(selection.final_score)}
                                        {selection.missed_cut ? ' +10' : ''})
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                              {formatScore(participant.final_score)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deletingCompetition && (
        <DeleteModal
          competition={deletingCompetition}
          onConfirm={() => handleDelete(deletingCompetition)}
          onCancel={() => setDeletingCompetition(null)}
        />
      )}
    </div>
  );
}