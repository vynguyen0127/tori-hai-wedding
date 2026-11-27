import type { RsvpResponse } from '@/types';

function badge(status: string | null, label?: string): string {
  const s = status ?? 'pending';
  const text = label ?? (s === 'attending' ? 'Attending' : s === 'declined' ? 'Declined' : 'Pending');
  return `<span style="display:inline-block;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;padding:3px 10px;border-radius:99px;background:${s === 'attending' ? '#EBF3EE' : '#FDECEA'};color:${s === 'attending' ? '#5E8A6E' : '#B5383A'}">${text}</span>`;
}

export function adminNotificationTemplate(householdName: string, responses: RsvpResponse[]): string {
  const guestRows = responses.map(r => `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #E2DDD8;font-size:14px;font-weight:600">${r.fullName}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #E2DDD8;text-align:center">${r.teaCeremonyRsvp !== null ? badge(r.teaCeremonyRsvp) : '<span style="color:#C0B9B0">—</span>'}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #E2DDD8;text-align:center">${r.ceremonyRsvp !== null ? badge(r.ceremonyRsvp) : '<span style="color:#C0B9B0">—</span>'}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #E2DDD8;text-align:center">${badge(r.status)}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #E2DDD8;font-size:13px;color:#6E6860">${r.dietaryNotes || '—'}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #E2DDD8;font-size:13px;color:#6E6860">${r.plusOneName || '—'}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:Georgia,serif;color:#1C1B19;background:#F7F6F3;margin:0;padding:0">
  <div style="max-width:640px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #E2DDD8">
    <div style="background:#1C1B19;padding:28px 40px;text-align:center">
      <h1 style="color:#F7F6F3;font-size:20px;margin:0;font-weight:normal;letter-spacing:0.05em">Tori &amp; Hai</h1>
      <p style="color:#8A8070;font-size:13px;margin:6px 0 0">New RSVP — ${householdName}</p>
    </div>
    <div style="padding:32px 40px">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="border-bottom:2px solid #E2DDD8">
            <th style="padding:8px 8px 12px;text-align:left;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#8A8070;font-weight:600">Guest</th>
            <th style="padding:8px 8px 12px;text-align:center;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#8A8070;font-weight:600">Tea</th>
            <th style="padding:8px 8px 12px;text-align:center;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#8A8070;font-weight:600">Ceremony</th>
            <th style="padding:8px 8px 12px;text-align:center;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#8A8070;font-weight:600">Reception</th>
            <th style="padding:8px 8px 12px;text-align:left;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#8A8070;font-weight:600">Dietary</th>
            <th style="padding:8px 8px 12px;text-align:left;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#8A8070;font-weight:600">+1</th>
          </tr>
        </thead>
        <tbody>${guestRows}</tbody>
      </table>
    </div>
    <div style="background:#F7F6F3;padding:16px 40px;text-align:center;font-size:12px;color:#8A8070;border-top:1px solid #E2DDD8">
      May 29, 2027 &nbsp;·&nbsp; White Oaks on the Bayou, Houston TX
    </div>
  </div>
</body>
</html>`;
}

export function guestConfirmationTemplate(householdName: string, responses: RsvpResponse[]): string {
  const anyAttending = responses.some(r => r.status === 'attending');

  const guestCards = responses.map(r => {
    const events: string[] = [];
    if (r.teaCeremonyRsvp === 'attending') events.push('Tea Ceremony &nbsp;(May 28, 12:00 PM)');
    if (r.ceremonyRsvp === 'attending')    events.push('Wedding Ceremony &nbsp;(May 29, 10:00 AM)');
    if (r.status === 'attending')          events.push('Reception &nbsp;(May 29, 5:00 PM)');

    return `
    <div style="padding:16px 0;border-bottom:1px solid #E2DDD8">
      <div style="font-size:15px;font-weight:bold;margin-bottom:8px">${r.fullName}</div>
      ${events.length > 0
        ? events.map(e => `<div style="font-size:13px;color:#5E8A6E;margin-bottom:4px">✓ ${e}</div>`).join('')
        : `<div style="font-size:13px;color:#B5383A">Unable to attend</div>`
      }
      ${r.dietaryNotes ? `<div style="font-size:13px;color:#6E6860;margin-top:6px">🥗 ${r.dietaryNotes}</div>` : ''}
      ${r.plusOneName  ? `<div style="font-size:13px;color:#6E6860;margin-top:4px">＋1 ${r.plusOneName}${r.plusOneDietaryNotes ? ` &mdash; ${r.plusOneDietaryNotes}` : ''}</div>` : ''}
    </div>`;
  }).join('');

  const message = anyAttending
    ? `We're so excited to celebrate with you! Your RSVP has been received. Below is a summary of your responses.`
    : `Thank you for letting us know. We're sorry you won't be able to make it, but we appreciate you taking the time to respond.`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:Georgia,serif;color:#1C1B19;background:#F7F6F3;margin:0;padding:0">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #E2DDD8">
    <div style="background:#1C1B19;padding:32px 40px;text-align:center">
      <h1 style="color:#F7F6F3;font-size:22px;margin:0;font-weight:normal;letter-spacing:0.05em">Tori &amp; Hai</h1>
      <p style="color:#8A8070;font-size:13px;margin:6px 0 0">May 29, 2027 &nbsp;·&nbsp; Houston, TX</p>
    </div>

    <div style="padding:32px 40px">
      <p style="font-size:18px;font-weight:normal;margin:0 0 8px">Dear ${householdName},</p>
      <p style="font-size:15px;line-height:1.7;color:#3A3732;margin:0 0 24px">${message}</p>

      <div style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#8A8070;margin-bottom:12px">Your RSVP Summary</div>

      ${guestCards}

      ${anyAttending ? `
      <div style="background:#F7F6F3;border-radius:8px;padding:20px 24px;margin-top:24px;font-size:13px;color:#6E6860;line-height:1.9">
        <div style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#1C1B19;margin-bottom:10px">Event Details</div>
        <strong style="color:#1C1B19">Tea Ceremony</strong>
        Thursday, May 28, 2027 &nbsp;·&nbsp; 12:00 PM<br />
        19311 Round Prairie Lane, Cypress TX 77433<br /><br />
        <strong style="color:#1C1B19">Wedding Ceremony</strong>
        Friday, May 29, 2027 &nbsp;·&nbsp; 10:00 AM<br />
        Vietnam Buddhist Center, 10002 Synott Rd, Sugar Land TX 77478<br /><br />
        <strong style="color:#1C1B19">Reception</strong>
        Friday, May 29, 2027 &nbsp;·&nbsp; 5:00 PM<br />
        White Oaks on the Bayou, Houston TX
      </div>` : ''}
    </div>

    <div style="background:#F7F6F3;padding:20px 40px;text-align:center;font-size:12px;color:#8A8070;border-top:1px solid #E2DDD8">
      Questions? <a href="mailto:hello@htwedding2027.com" style="color:#8A8070">Email us</a> and we'll be happy to help.
    </div>
  </div>
</body>
</html>`;
}
