'use client';

import { useState, useEffect } from 'react';

/**
 * EnvelopeIntro
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-screen envelope animation that plays on every home page visit.
 *
 * Stages:
 *   entering  – envelope visible, sealed, waiting for click
 *   open      – flap folds away (clip-path collapses)
 *   rising    – invite card slides up out of the envelope
 *   done      – overlay unmounted
 *
 * After the card has risen an "Enter website" button appears.
 */


export default function EnvelopeIntro() {
  const [stage, setStage]     = useState('idle');
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('env-seen')) {
      setStage('done');   // returning visitor — drop the cover instantly
    } else {
      setStage('entering'); // first visit — show the envelope
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

  // 'idle' = before useEffect has run (SSR + first client paint).
  // Render a plain cover so the home page is never visible during the check.
  if (stage === 'idle') {
    return <div style={{ position: 'fixed', inset: 0, background: '#f0f6fa', zIndex: 9999 }} />;
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
            <h2 className="env-card__names">Tori &amp; Hai</h2>
            <p className="env-card__ornament">✦</p>
            <p className="env-card__date">Saturday, May 29th</p>
            <p className="env-card__year">2027</p>
          </div>

          {/* ── Pocket (envelope front face) ──────────────────────────────── */}
          <div className="env-pocket" />

          {/* ── Flap (no children — seal is a sibling to avoid clip-path) ─── */}
          <div className={`env-flap${flapOpen ? ' env-flap--open' : ''}`} />

          {/* ── Seal — positioned at the V-tip of the flap ────────────────── */}
          <div className={`env-seal${flapOpen ? ' env-seal--gone' : ''}`}>♡</div>

        </div>
      </div>

      {/* Fixed-height footer so the envelope never shifts position */}
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
