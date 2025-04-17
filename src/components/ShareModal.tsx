import React, { useState } from 'react';
import { X, Copy } from 'lucide-react';

interface Props {
  competitionId: string;
  onClose: () => void;
}

export default function ShareModal({ competitionId, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/competition/${competitionId}?mode=view`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Share Competition</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          Share this link with others to let them view the competition:
        </p>
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex-1 bg-gray-100 p-3 rounded-md font-mono text-sm break-all">
            {shareUrl}
          </div>
          <button
            onClick={handleCopy}
            className="p-2 text-green-600 hover:text-green-700"
            title="Copy link"
          >
            <Copy className="h-5 w-5" />
          </button>
        </div>
        {copied && (
          <p className="text-sm text-green-600">Link copied to clipboard!</p>
        )}
      </div>
    </div>
  );
}