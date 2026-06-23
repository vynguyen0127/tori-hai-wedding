'use client';

import { useState, useEffect } from 'react';

// UPDATE THIS DATE to match your actual wedding date + time
const WEDDING_DATE = new Date('2027-05-29T17:00:00');

function pad(n) {
  return String(n).padStart(2, '0');
}

function getTimeLeft() {
  const now = new Date();
  const diff = WEDDING_DATE - now;
  if (diff <= 0) return null;

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(null);

  // Initialize on client only to avoid hydration mismatch
  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (timeLeft === null) return null; // renders nothing on server

  if (!timeLeft) {
    return <div className="countdown-done">Today is the day! ♡</div>;
  }

  const units = [
    { label: 'Days',    value: timeLeft.days         },
    { label: 'Hours',   value: pad(timeLeft.hours)   },
    { label: 'Minutes', value: pad(timeLeft.minutes) },
    { label: 'Seconds', value: pad(timeLeft.seconds) },
  ];

  return (
    <div className="countdown">
      {units.map(({ label, value }) => (
        <div className="countdown-unit" key={label}>
          <span className="countdown-number">{value}</span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
