export function adminNotificationTemplate(householdName: string, guestHtml: string): string {
    return `<!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8" />
                    <style>
                    body { font-family: Georgia, serif; color: #1C1B19; background: #F7F6F3; margin: 0; padding: 0; }
                    .wrapper { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #E2DDD8; }
                    .header { background: #1C1B19; padding: 32px 40px; text-align: center; }
                    .header h1 { color: #F7F6F3; font-size: 22px; margin: 0; font-weight: normal; letter-spacing: 0.05em; }
                    .header p { color: #8A8070; font-size: 13px; margin: 6px 0 0; }
                    .body { padding: 32px 40px; }
                    .household { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
                    .timestamp { font-size: 12px; color: #8A8070; margin-bottom: 24px; }
                    .guest { padding: 16px 0; border-bottom: 1px solid #E2DDD8; }
                    .guest:last-child { border-bottom: none; }
                    .guest-name { font-size: 15px; font-weight: bold; margin-bottom: 6px; }
                    .badge { display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 99px; }
                    .badge--attending { background: #EBF3EE; color: #5E8A6E; }
                    .badge--declined  { background: #FDECEA; color: #B5383A; }
                    .detail { font-size: 13px; color: #6E6860; margin-top: 6px; }
                    .footer { background: #F7F6F3; padding: 20px 40px; text-align: center; font-size: 12px; color: #8A8070; border-top: 1px solid #E2DDD8; }
                    </style>
                </head>
                <body>
                    <div class="wrapper">
                    <div class="header">
                        <h1>Tori &amp; Hai</h1>
                        <p>New RSVP received</p>
                    </div>

                    <div class="body">
                        <div class="household">${householdName}</div>
                        <div class="timestamp">Submitted <!-- TIMESTAMP e.g. new Date().toLocaleString() --></div>

                            ${guestHtml}
                    </div>

                    <div class="footer">
                        May 29, 2027 &nbsp;·&nbsp; White Oaks on the Bayou, Houston TX
                    </div>
                    </div>
                </body>
                </html>`
}

export function guestConfirmationTemplate(householdName: string, guestHtml: string): string {
    return `
    <!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Georgia, serif; color: #1C1B19; background: #F7F6F3; margin: 0; padding: 0; }
      .wrapper { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #E2DDD8; }
      .header { background: #1C1B19; padding: 32px 40px; text-align: center; }
      .header h1 { color: #F7F6F3; font-size: 22px; margin: 0; font-weight: normal; letter-spacing: 0.05em; }
      .header p { color: #8A8070; font-size: 13px; margin: 6px 0 0; }
      .body { padding: 32px 40px; }
      .message { font-size: 16px; line-height: 1.7; margin-bottom: 24px; color: #1C1B19; }
      .divider { border: none; border-top: 1px solid #E2DDD8; margin: 24px 0; }
      .summary-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #8A8070; margin-bottom: 12px; }
      /* guest card styles reused from admin email */
      .guest { padding: 16px 0; border-bottom: 1px solid #E2DDD8; }
      .guest:last-child { border-bottom: none; }
      .guest-name { font-size: 15px; font-weight: bold; margin-bottom: 6px; }
      .badge { display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 99px; }
      .badge--attending { background: #EBF3EE; color: #5E8A6E; }
      .badge--declined  { background: #FDECEA; color: #B5383A; }
      .detail { font-size: 13px; color: #6E6860; margin-top: 6px; }
      .details-box { background: #F7F6F3; border-radius: 8px; padding: 20px 24px; margin-top: 24px; font-size: 13px; color: #6E6860; line-height: 1.8; }
      .details-box strong { color: #1C1B19; display: block; margin-bottom: 4px; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; }
      .footer { background: #F7F6F3; padding: 20px 40px; text-align: center; font-size: 12px; color: #8A8070; border-top: 1px solid #E2DDD8; }
      .footer a { color: #8A8070; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>Tori &amp; Hai</h1>
        <p>May 29, 2027 &nbsp;·&nbsp; Houston, TX</p>
      </div>

      <div class="body">
        <p class="message">
          Thank you for your RSVP, ${householdName}
          We've received your response and can't wait to celebrate with you.
        </p>

        <hr class="divider" />

        <div class="summary-label">Your RSVP Summary</div>

        ${guestHtml}

        <div class="details-box">
          <strong>Event Details</strong>
          Saturday, May 29, 2027<br />
          White Oaks on the Bayou<br />
          Houston, TX<br /><br />
          Ceremony begins at 5:00 PM
        </div>
      </div>

      <div class="footer">
        Questions? <a href="mailto:tori@example.com">Email us</a> and we'll be happy to help.
      </div>
    </div>
  </body>
</html>
    `
}