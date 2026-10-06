'use client';

import { useState, useEffect } from 'react';

/**
 * EnvelopeIntro
 *
 * Stages:
 *   idle      – SSR / first paint, plain cover
 *   entering  – sealed envelope, waiting for click
 *   opening   – flap folds back (perspective rotate)
 *   rising    – card slides up out of envelope
 *   stacked   – card settles on top of envelope; "Enter" button appears
 *   done      – overlay unmounted
 */
export default function EnvelopeIntro() {
  const [stage, setStage]     = useState('idle');
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('env-seen')) {
      setStage('done');
    } else {
      setStage('entering');
    }
  }, []);

  function openEnvelope() {
    if (stage !== 'entering') return;
    setStage('opening');
    // flap folds: 900ms → start pulling card
    setTimeout(() => setStage('rising'),  900);
    // card clears envelope top: 900 + 800ms → settle stacked
    setTimeout(() => setStage('stacked'), 1700);
  }

  function enter() {
    sessionStorage.setItem('env-seen', '1');
    setExiting(true);
    setTimeout(() => setStage('done'), 700);
  }

  if (stage === 'done') return null;
  if (stage === 'idle') {
    return <div style={{ position: 'fixed', inset: 0, background: '#e8f0e2', zIndex: 9999 }} />;
  }

  const flapOpen  = stage === 'opening' || stage === 'rising' || stage === 'stacked';
  const isRising  = stage === 'rising'  || stage === 'stacked';
  const isStacked = stage === 'stacked';
  const clickable = stage === 'entering';

  return (
    <div
      className={[
        'env-overlay',
        exiting   ? 'env-overlay--exit'     : '',
        clickable ? 'env-overlay--tappable' : '',
      ].filter(Boolean).join(' ')}
      onClick={clickable ? openEnvelope : undefined}
    >
      <div className="env-scene" onClick={clickable ? openEnvelope : (e) => e.stopPropagation()}>
        <div className="env-wrap">

          {/* Envelope back wall */}
          <div className="env-body" />

          {/* Invite card */}
          <div className={[
            'env-card',
            isRising  ? 'env-card--rising'  : '',
            isStacked ? 'env-card--stacked' : '',
          ].filter(Boolean).join(' ')}>
            <p className="env-card__eyebrow">You are cordially invited</p>
            <div className="env-card__rule" />
            <h2 className="env-card__names">Victoria &amp; Hai</h2>
            <p className="env-card__ornament">✿</p>
            <p className="env-card__date">Saturday, May 29th</p>
            <p className="env-card__year">2027</p>
          </div>

          {/* Pocket — front face of envelope, hides card before flap opens */}
          <div className="env-pocket" />

          {/* Flap — folds back using perspective rotate */}
          <div className={`env-flap${flapOpen ? ' env-flap--open' : ''}`} />

          {/* Wax seal */}
          <div className={`env-seal${flapOpen ? ' env-seal--gone' : ''}`}>♡</div>

        </div>
      </div>

      <div className="env-footer">
        {isStacked ? (
          <button className="env-enter-btn" onClick={enter}>
            Enter website
          </button>
        ) : clickable ? (
          <p className="env-skip">tap to open</p>
        ) : null}
      </div>
    </div>
  );
}
