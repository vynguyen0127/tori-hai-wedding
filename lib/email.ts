import { RsvpResponse } from '@/types';
import { Resend } from 'resend'
import { adminNotificationTemplate, guestConfirmationTemplate } from './emailTemplates';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRsvpNotification(RsvpResponses: RsvpResponse[], householdName: string) {
console.log('[email] RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);
console.log('[email] email set:', process.env.ADMIN_EMAIL);

    const guestHTML = guestResponsesToHTML(RsvpResponses);
    let fallbackEnabled = false;

    let generatedBody = '';
    try {
      generatedBody = await generateConfirmationEmail(householdName, RsvpResponses);
    } catch (err) {
      console.error('[email] failed to generate confirmation email', err);
      fallbackEnabled = true;
      generatedBody = guestHTML
    }
console.log('[email] email generated:', generatedBody);
    await Promise.all([
        resend.emails.send({
        from: 'onboarding@resend.dev',
        to: process.env.ADMIN_EMAIL!.split(','),
        subject: `RSVP Update — ${householdName}`,
        html: adminNotificationTemplate(householdName, guestHTML),
        }),
        resend.emails.send({
        from: 'onboarding@resend.dev',
        to: process.env.ADMIN_EMAIL!.split(','),
        subject: 'Your RSVP is confirmed — Tori & Hai',
        html: guestConfirmationTemplate(householdName, generatedBody, fallbackEnabled),
        }),
    ]);
}

function guestResponsesToHTML(RsvpResponses: RsvpResponse[]): string{

        return RsvpResponses.map((response) => 
        `                
        <div class="guest">
          <div class="guest-name">${response.fullName}</div>
          ${response.status == 'attending' ? 
            `<span class="badge badge--attending">Attending</span>` :
            `<span class="badge badge--declined">Declined</span>`     
          }
          

          <!-- IF dietaryNotes -->
          ${response.dietaryNotes ? `<div class="detail">🥗 ${response.dietaryNotes}</div>` : ''}

          <!-- IF plusOneName -->
          ${response.plusOneName != "" ? 
            `
            <div class="detail">＋1 ${response.plusOneName}
                <!-- IF plusOneDietaryNotes -->
                ${response.plusOneDietaryNotes ? `&mdash; ${response.plusOneDietaryNotes}` : ''}
          </div>`
            : ``
          }

        </div>`
    ).join('');
}

async function generateConfirmationEmail(
  householdName: string,
  responses: RsvpResponse[]
): Promise<string> {
  const attending = responses.filter(r => r.status === 'attending')
  const declined = responses.filter(r => r.status == 'declined')

  const guestSummary = responses.map(r =>
      `${r.fullName}: ${r.status}` +
      (r.dietaryNotes ? `, dietary notes: ${r.dietaryNotes}` : '') +
      (r.plusOneName  ? `, plus-one: ${r.plusOneName}` : '')
    ).join('\n');

  const message = await anthropic.messages.create({
    model: 'claude-fable-5',
    max_tokens: 1024,
    system: `You are writing warm, personal confirmation emails for a wedding.
The wedding is for Tori and Hai on May 29, 2027 at White Oaks on the Bayou in Houston, TX.
Ceremony begins at 5:00 PM. Write in a warm, celebratory tone.
Return only the email body HTML — no subject line, no markdown, just the inner HTML content.
Use simple inline styles for any formatting.`,
    messages: [{
      role: 'user',
      content: `Write a confirmation email for the ${householdName} household.

Guest responses:
${guestSummary}

${attending.length > 0 ? `${attending.length} guest(s) are attending.` : ''}
${declined.length > 0  ? `${declined.length} guest(s) are unable to attend.` : ''}

Acknowledge their specific details — mention dietary needs and plus-ones by name if present.
Keep it under 150 words.`
    }]
  });

  const block = message.content[0];
  return block.type === 'text' ? block.text : '';
}