// This script handles form submissions, saves them to the active Google Sheet, and sends a modern HTML email notification.

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // Wait up to 30 seconds.

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName('Sheet1'); // IMPORTANT: Make sure this sheet name is correct.
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    const newRow = headers.map(header => {
      if (header.toLowerCase() === 'timestamp') {
        return new Date().toUTCString();
      }
      return e.parameter[header] || '';
    });

    sheet.appendRow(newRow);

    // --- Send Modern HTML Email Notification ---
    const recipientEmail = "";
    const subject = "New Contact Form Submission from " + (e.parameter.name || 'Unknown');

    // Build the HTML table rows for the email body dynamically.
    let dataRows = '';
    headers.forEach(function(header) {
      if (header.toLowerCase() !== 'timestamp') { // Optionally skip timestamp in email
        let title = header.charAt(0).toUpperCase() + header.slice(1);
        let value = e.parameter[header] || 'Not provided';
        // Handle newlines in the message field
        let formattedValue = value.replace(/\n/g, '<br>');
        
        dataRows += `
          <tr>
            <td valign="top" style="padding: 8px 15px 8px 0; font-size: 15px; color: #1a202c; font-weight: 600; width: 120px;">${title}:</td>
            <td valign="top" style="padding: 8px 0; font-size: 15px; color: #4a5568;">${formattedValue}</td>
          </tr>
        `;
      }
    });

    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 20px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <tr>
                <td align="left" style="padding: 25px 30px;">
                   <a href="https://atikle.github.io/home" target="_blank">
                     <img src="https://atikle.github.io/resource/atikle-logo_multicolor.png" alt="atikle logo" style="width: 20%; min-width: 100px; height: auto; border: 0;">
                   </a>
                </td>
              </tr>
              <!-- Title -->
              <tr>
                <td align="center" style="padding: 0 30px 15px 30px;">
                  <h1 style="font-size: 26px; font-weight: 600; color: #1a202c; margin: 0;">New Form Submission</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px;">
                  <hr style="border: 0; border-top: 1px solid #e2e8f0;">
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 25px 30px 20px 30px;">
                  <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">You've received a new message from <strong>${e.parameter.name || 'Unknown'}</strong>.</p>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                    ${dataRows}
                  </table>
                  <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin-top: 25px; margin-bottom: 0;">Sincerely,</p>
                  <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin-top: 5px; margin-bottom: 0;">The atikle Help Centre Team</p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td align="center" style="padding: 20px 30px; background-color: #ffffff; border-top: 1px solid #e2e8f0; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                  <p style="font-size: 12px; color: #718096; margin: 0;">This is an automated notification. Sent by atikle webflow on ${new Date().toLocaleString("en-IN", {timeZone: "Asia/Kolkata"})} IST.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // Use the object format for MailApp to send an HTML email.
    MailApp.sendEmail({
      to: recipientEmail,
      subject: subject,
      htmlBody: htmlBody,
      name: "atikle Help Centre Team", // This sets the sender name.
      replyTo: e.parameter.email     // This sets the reply-to address to the user's email.
    });
    // --- End Email Notification ---

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'data': JSON.stringify(e.parameter) }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error(error);
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
