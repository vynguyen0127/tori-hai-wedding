import React, { useState, useEffect } from 'react';
import './Countdown.css';

// UPDATE THIS DATE to your actual wedding date
const WEDDING_DATE = new Date('2027-06-05T17:00:00');

function pad(n) {
  return String(n).padStart(2, '0');
}

function getTimeLeft() {
  const now = new Date();
  const diff = WEDDING_DATE - now;
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) {
    return <div className="countdown-done">Today is the day! ♡</div>;
  }

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: pad(timeLeft.hours) },
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
