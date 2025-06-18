'use client';

import { type FC } from 'react';
import { useButtonContext } from './context/ButtonContext';

export const FancyButton: FC = () => {
  const { active, setActive } = useButtonContext();

  return (
    <button
      type="button"
      className={`fancy-button${active ? ' active' : ''}`}
      onClick={() => setActive(!active)}
      aria-pressed={active}
    >
      <div className="points_wrapper">
        {Array.from({ length: 10 }).map((_, i) => (
          <i key={i} className="point" />
        ))}
      </div>
      <span className="inner">
        <svg
          className="icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 0 20" />
          <path d="M12 2a15.3 15.3 0 0 0 0 20" />
        </svg>
        <span>Search</span>
      </span>
    </button>
  );
};
