import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            For Entertainment Purposes Only: This golf sweepstakes platform is designed purely for entertainment and friendly competition. 
            No real money gambling or betting is involved or permitted.
          </p>
        </div>
      </div>
    </div>
  );
}