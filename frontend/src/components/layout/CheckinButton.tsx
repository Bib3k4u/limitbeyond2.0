import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CheckinButton({ userId, name, size = 'md' }: { userId: string, name?: string, size?: 'sm'|'md'|'lg' }) {
  const navigate = useNavigate();
  const go = () => navigate(`/checkin/${userId}`);
  const sizes: Record<string,string> = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };
  return (
    <button onClick={go} className={`inline-flex items-center gap-2 ${sizes[size]} bg-lb-accent text-white rounded shadow hover:brightness-105`}>
      <span className="font-medium">Checkin</span>
      {name && <span className="text-xs text-white/80">{name}</span>}
    </button>
  );
}
