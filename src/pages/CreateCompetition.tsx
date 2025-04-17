import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { TOURNAMENTS_2025, generateAccessCode } from '../lib/tournaments';
import { TOURNAMENT_THEMES } from '../lib/themes';
import BackButton from '../components/BackButton';

// Valid major types as defined in the database constraint
const VALID_MAJOR_TYPES = ['masters', 'pga', 'us_open', 'the_open', 'rbc_heritage'] as const;
type MajorType = typeof VALID_MAJOR_TYPES[number];

function CreateCompetition() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    majorType: 'masters' as MajorType,
  });
  const [error, setError] = useState('');

  const selectedTheme = TOURNAMENT_THEMES[formData.majorType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate major type before submission
      if (!VALID_MAJOR_TYPES.includes(formData.majorType as MajorType)) {
        throw new Error('Invalid tournament type selected');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const tournament = TOURNAMENTS_2025[formData.majorType];
      const accessCode = generateAccessCode();

      const { data, error: insertError } = await supabase
        .from('competitions')
        .insert([{
          title: formData.title,
          major_type: formData.majorType,
          access_code: accessCode,
          start_date: tournament.startDate.toISOString(),
          end_date: tournament.endDate.toISOString(),
          created_by: user.id
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      if (data) {
        navigate(`/competition/${data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("${selectedTheme.backgroundImage}")`,
      }}
    >
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <BackButton to="/dashboard" />
        </div>
        <div className="bg-white bg-opacity-95 rounded-lg shadow-xl p-8 backdrop-blur-sm">
          <h1 className="text-3xl font-bold mb-8" style={{ color: selectedTheme.primaryColor }}>
            Create New Competition
          </h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competition Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tournament
              </label>
              <select
                value={formData.majorType}
                onChange={(e) => setFormData(prev => ({ ...prev, majorType: e.target.value as MajorType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                style={{ 
                  '--tw-ring-color': selectedTheme.primaryColor,
                  borderColor: selectedTheme.primaryColor
                } as React.CSSProperties}
              >
                {VALID_MAJOR_TYPES.map((type) => {
                  const tournament = TOURNAMENTS_2025[type];
                  return (
                    <option key={type} value={type}>
                      {tournament.name} ({tournament.startDate.toLocaleDateString()} - {tournament.endDate.toLocaleDateString()})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-700">
                The tournament dates will be automatically set based on the official schedule.
                A secure access code will be generated for your competition.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 rounded-md text-white font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                backgroundColor: selectedTheme.primaryColor,
                '--tw-ring-color': selectedTheme.primaryColor
              } as React.CSSProperties}
            >
              Create Competition
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCompetition;