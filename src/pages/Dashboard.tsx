import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trophy, Users, Calendar, Trash2, X, Archive } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Disclaimer from '../components/Disclaimer';
import AdBanner from '../components/AdBanner';

interface Competition {
  id: string;
  title: string;
  major_type: string;
  start_date: string;
  end_date: string;
  access_code: string;
  participant_count?: number;
}

interface DeleteModalProps {
  competition: Competition;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal = ({ competition, onConfirm, onCancel }: DeleteModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-md w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Delete Competition</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="h-6 w-6" />
        </button>
      </div>
      <p className="text-gray-600 mb-4">
        Are you sure you want to delete "{competition.title}"? This action cannot be undone.
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
          Delete
        </button>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCompetition, setDeletingCompetition] = useState<Competition | null>(null);

  const fetchCompetitions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: competitionsData, error: competitionsError } = await supabase
        .from('competitions')
        .select('*')
        .eq('created_by', user.id);

      if (competitionsError) throw competitionsError;

      if (!competitionsData) {
        setCompetitions([]);
        return;
      }

      const competitionsWithCounts = await Promise.all(
        competitionsData.map(async (competition) => {
          const { count, error: countError } = await supabase
            .from('participants')
            .select('*', { count: 'exact', head: true })
            .eq('competition_id', competition.id);

          if (countError) {
            console.error('Error fetching participant count:', countError);
            return { ...competition, participant_count: 0 };
          }

          return { ...competition, participant_count: count || 0 };
        })
      );

      setCompetitions(competitionsWithCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch competitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const handleDelete = async (competition: Competition) => {
    try {
      const { error: deleteError } = await supabase
        .from('competitions')
        .delete()
        .eq('id', competition.id);

      if (deleteError) throw deleteError;

      setCompetitions(prevCompetitions => 
        prevCompetitions.filter(c => c.id !== competition.id)
      );
      setDeletingCompetition(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete competition');
    }
  };

  const getMajorTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      masters: 'The Masters',
      pga: 'PGA Championship',
      us_open: 'US Open',
      the_open: 'The Open'
    };
    return labels[type] || type;
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Competitions</h1>
          <div className="flex items-center space-x-4">
            <Link
              to="/archived"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Archive className="h-5 w-5 mr-2" />
              View Archived
            </Link>
            <Link
              to="/competition/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Competition
            </Link>
          </div>
        </div>

        <Disclaimer />
        <AdBanner slot="dashboard_top" />

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-8">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {competitions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No competitions</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new competition.</p>
            <div className="mt-6">
              <Link
                to="/competition/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Competition
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {competitions.map((competition) => (
              <div
                key={competition.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <Trophy className="h-8 w-8 text-green-600" />
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {getMajorTypeLabel(competition.major_type)}
                    </span>
                  </div>
                  <Link to={`/competition/${competition.id}`}>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">{competition.title}</h3>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(competition.start_date).toLocaleDateString()} - {new Date(competition.end_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-2" />
                        {competition.participant_count || 0} participants
                      </div>
                    </div>
                  </Link>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        Access Code: <span className="font-mono">{competition.access_code}</span>
                      </p>
                      <button
                        onClick={() => setDeletingCompetition(competition)}
                        className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                        title="Delete competition"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AdBanner slot="dashboard_bottom" format="horizontal" />
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