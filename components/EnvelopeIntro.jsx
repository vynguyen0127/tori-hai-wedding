'use client';

import { useState, useEffect } from 'react';

/**
 * EnvelopeIntro
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-screen envelope animation — plays once per browser session.
 *
 * Stages:
 *   idle      – before useEffect (SSR + first paint); shows a plain cover
 *   entering  – envelope sealed, waiting for the user's click
 *   open      – flap folds away
 *   rising    – invite card slides up; "Enter website" button appears
 *   done      – overlay unmounted
 */
export default function EnvelopeIntro() {
  const [stage, setStage]     = useState('idle');
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('env-seen')) {
      setStage('done');   // returning visitor this session — skip straight away
    } else {
      setStage('entering');
    }
  }, []);

  function openEnvelope() {
    if (stage !== 'entering') return;
    setStage('open');
    setTimeout(() => setStage('rising'), 1100);
  }

  function enter() {
    sessionStorage.setItem('env-seen', '1');
    setExiting(true);
    setTimeout(() => setStage('done'), 700);
  }

  if (stage === 'done') return null;

  // Blank sage cover during SSR / first paint — prevents home-page flash
  if (stage === 'idle') {
    return <div style={{ position: 'fixed', inset: 0, background: '#e8f0e2', zIndex: 9999 }} />;
  }

  const flapOpen     = stage === 'open' || stage === 'rising';
  const showEnterBtn = stage === 'rising';
  const clickable    = stage === 'entering';

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

          {/* ── Envelope back wall ───────────────────────────────────────── */}
          <div className="env-body" />

          {/* ── Invite card ──────────────────────────────────────────────── */}
          <div className={`env-card${stage === 'rising' ? ' env-card--up' : ''}`}>
            <p className="env-card__eyebrow">You are cordially invited</p>
            <div className="env-card__rule" />
            <h2 className="env-card__names">Victoria &amp; Hai</h2>
            <p className="env-card__ornament">✿</p>
            <p className="env-card__date">Saturday, May 29th</p>
            <p className="env-card__year">2027</p>
          </div>

          {/* ── Pocket (envelope front face) ──────────────────────────────── */}
          {/* Covers the full front from top corners through the bottom V,    */}
          {/* so the card is completely hidden before the flap opens.         */}
          <div className="env-pocket" />

          {/* ── Flap ─────────────────────────────────────────────────────── */}
          <div className={`env-flap${flapOpen ? ' env-flap--open' : ''}`} />

          {/* ── Wax seal — sibling of flap so clip-path never hides it ────── */}
          <div className={`env-seal${flapOpen ? ' env-seal--gone' : ''}`}>♡</div>

        </div>
      </div>

      {/* Fixed-height footer so the envelope never shifts when button appears */}
      <div className="env-footer">
        {showEnterBtn ? (
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
