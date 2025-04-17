import React from 'react';
import { Goal as GolfBall, Trophy, Users, Clock, Share2, Award } from 'lucide-react';
import Disclaimer from '../components/Disclaimer';
import AdBanner from '../components/AdBanner';

export default function HowTo() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <GolfBall className="mx-auto h-16 w-16 text-green-600" />
          <h1 className="mt-4 text-4xl font-bold text-gray-900">How To Play</h1>
          <p className="mt-2 text-lg text-gray-600">
            Your guide to running a successful golf sweepstakes
          </p>
        </div>

        <Disclaimer />
        <AdBanner slot="howto_top" />

        <div className="space-y-12">
          {/* Setting Up */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Trophy className="h-8 w-8 text-green-600 mr-4" />
              <h2 className="text-2xl font-bold text-gray-900">Setting Up the Competition</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-600">
                One person takes the role of competition organizer and sets up the tournament. They will:
              </p>
              <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside">
                <li>Create an account and log in</li>
                <li>Select the major tournament they want to run a competition for</li>
                <li>Set up the competition with a unique name</li>
                <li>Share the competition link with friends to view the leaderboard</li>
              </ul>
            </div>
          </section>

          {/* Player Selection */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Users className="h-8 w-8 text-green-600 mr-4" />
              <h2 className="text-2xl font-bold text-gray-900">Player Selection</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-600">
                Player selection becomes available one week before the tournament starts. Here's what you need to know:
              </p>
              <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside">
                <li>Each participant must select exactly 4 players</li>
                <li>The combined odds of your selected players must be at least 150/1</li>
                <li>Official odds will be published when player selection opens</li>
                <li>All selections must be made before the tournament begins</li>
              </ul>
            </div>
          </section>

          {/* Scoring */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Award className="h-8 w-8 text-green-600 mr-4" />
              <h2 className="text-2xl font-bold text-gray-900">Scoring and Winning</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-600">
                The competition uses a straightforward scoring system:
              </p>
              <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside">
                <li>Each player's actual tournament score counts toward your total</li>
                <li>If any of your selected players miss the cut, they receive a +10 shot penalty</li>
                <li>The participant with the lowest combined score from their 4 players wins</li>
                <li>Scores update automatically throughout the tournament</li>
              </ul>
            </div>
          </section>

          {/* Live Updates */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Clock className="h-8 w-8 text-green-600 mr-4" />
              <h2 className="text-2xl font-bold text-gray-900">Live Updates</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-600">
                Stay engaged throughout the tournament:
              </p>
              <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside">
                <li>Leaderboard updates automatically as scores change</li>
                <li>Track your players' performance in real-time</li>
                <li>See who's made the cut and who hasn't</li>
                <li>Watch the competition unfold live</li>
              </ul>
            </div>
          </section>

          {/* Sharing */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Share2 className="h-8 w-8 text-green-600 mr-4" />
              <h2 className="text-2xl font-bold text-gray-900">Sharing and Viewing</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-600">
                Keep everyone in the loop:
              </p>
              <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside">
                <li>Competition organizer can share a view-only link with participants</li>
                <li>Anyone with the link can view the live leaderboard</li>
                <li>No account needed to view competition progress</li>
                <li>Share the excitement with friends and family</li>
              </ul>
            </div>
          </section>
        </div>

        <AdBanner slot="howto_bottom" format="horizontal" />
      </div>
    </div>
  );
}