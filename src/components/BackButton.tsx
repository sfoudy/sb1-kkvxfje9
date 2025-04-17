import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface Props {
  to?: string;
  label?: string;
}

export default function BackButton({ to, label = 'Back' }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-black bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all duration-200 shadow-lg backdrop-blur-sm"
    >
      <ArrowLeft className="h-6 w-6 mr-2" />
      {label}
    </button>
  );
}