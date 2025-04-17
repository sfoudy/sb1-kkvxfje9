import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Goal as GolfBall, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Don't show auth buttons on login or register pages
  const showAuthButtons = !['/login', '/register'].includes(location.pathname);

  // Don't render auth buttons while loading
  if (isLoading && showAuthButtons) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <GolfBall className="h-8 w-8 text-green-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Golf Majors Sweepstakes</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <GolfBall className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Golf Majors Sweepstakes</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/how-to"
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <HelpCircle className="h-5 w-5 mr-1" />
              How To Play
            </Link>
            {showAuthButtons && (
              isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;