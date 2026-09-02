'use client';

import { useState, useEffect } from 'react';

const WEDDING_DATE = new Date('2027-05-29T17:00:00');

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function getTimeLeft(): TimeLeft | null {
  const diff = WEDDING_DATE.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  // Initialize on the client only — avoids a hydration mismatch between the
  // server-rendered "0 days" and the actual value.
  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) {
    return <div className="countdown-done">Today is the day! ♡</div>;
  }

  const units = [
    { label: 'Days',    value: String(timeLeft.days) },
    { label: 'Hours',   value: pad(timeLeft.hours) },
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
