import { RsvpResponse } from '@/types';
import { Resend } from 'resend'
import { adminNotificationTemplate, guestConfirmationTemplate } from './emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRsvpNotification(RsvpResponses: RsvpResponse[], householdName: string) {
  console.log('[email] RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);
  console.log('[email] email set:', process.env.ADMIN_EMAIL);

  const guestHTML = guestResponsesToHTML(RsvpResponses);
  const guestEmails = RsvpResponses.map(r => r.email).filter(Boolean);
  console.log('[email] guest emails:', guestEmails);

  const sends: Promise<unknown>[] = [
    resend.emails.send({
      from: 'hello@htwedding2027.com',
      to: process.env.ADMIN_EMAIL!.split(','),
      subject: `RSVP Update — ${householdName}`,
      html: adminNotificationTemplate(householdName, guestHTML),
    }).then(r => console.log('[email] admin send result:', JSON.stringify(r))),
  ];

  if (guestEmails.length > 0) {
    sends.push(
      resend.emails.send({
        from: 'hello@htwedding2027.com',
        to: guestEmails,
        subject: 'Your RSVP is confirmed — Tori & Hai',
        html: guestConfirmationTemplate(householdName, guestHTML),
      }).then(r => console.log('[email] guest send result:', JSON.stringify(r)))
    );
  } else {
    console.log('[email] no guest emails — skipping confirmation send');
  }

  await Promise.all(sends);
}

function guestResponsesToHTML(RsvpResponses: RsvpResponse[]): string {
  return RsvpResponses.map((response) =>
    `<div class="guest">
      <div class="guest-name">${response.fullName}</div>
      ${response.status === 'attending'
        ? `<span class="badge badge--attending">Attending</span>`
        : `<span class="badge badge--declined">Declined</span>`
      }
      ${response.dietaryNotes ? `<div class="detail">🥗 ${response.dietaryNotes}</div>` : ''}
      ${response.plusOneName
        ? `<div class="detail">＋1 ${response.plusOneName}${response.plusOneDietaryNotes ? ` &mdash; ${response.plusOneDietaryNotes}` : ''}</div>`
        : ''
      }
    </div>`
  ).join('');
}
