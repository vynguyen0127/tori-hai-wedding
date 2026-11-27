import { RsvpResponse } from '@/types';
import { Resend } from 'resend'
import { adminNotificationTemplate, guestConfirmationTemplate } from './emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRsvpNotification(RsvpResponses: RsvpResponse[], householdName: string) {
  console.log('[email] RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);
  console.log('[email] email set:', process.env.ADMIN_EMAIL);

  const guestHTML = guestResponsesToHTML(RsvpResponses);
  const guestEmails = RsvpResponses.map(r => r.email).filter(Boolean);

  const [adminResult, guestResult] = await Promise.all([
    resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL!.split(','),
      subject: `RSVP Update — ${householdName}`,
      html: adminNotificationTemplate(householdName, guestHTML),
    }),
    resend.emails.send({
      from: 'onboarding@resend.dev',
      to: guestEmails,
      subject: 'Your RSVP is confirmed — Tori & Hai',
      html: guestConfirmationTemplate(householdName, guestHTML),
    }),
  ]);
  console.log('[email] admin send result:', JSON.stringify(adminResult));
  console.log('[email] guest send result:', JSON.stringify(guestResult));
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
