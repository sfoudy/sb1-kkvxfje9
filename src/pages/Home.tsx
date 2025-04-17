import React from 'react';
import { Link } from 'react-router-dom';
import { Goal as GolfBall, Trophy, Users, Share2 } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <GolfBall className="mx-auto h-16 w-16 text-green-600" />
          <h1 className="mt-4 text-4xl font-bold text-gray-900 sm:text-5xl">
            Golf Majors Sweepstakes
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Create and manage golf sweepstakes for all major tournaments
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <Trophy className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Major Tournaments</h3>
              <p className="mt-2 text-gray-600">
                Create sweepstakes for The Masters, PGA Championship, US Open, and The Open
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <Users className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Group Management</h3>
              <p className="mt-2 text-gray-600">
                Set up players, select golfers, and track scores in real-time
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <Share2 className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Easy Sharing</h3>
              <p className="mt-2 text-gray-600">
                Share your competition with friends using a simple access code
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/register"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-green-700"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;