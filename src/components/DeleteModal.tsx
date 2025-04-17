import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  participant: {
    username: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({ participant, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
          Delete Participant
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Are you sure you want to delete {participant.username}? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}