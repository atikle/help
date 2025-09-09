// This script handles form submissions, saves them to the active Google Sheet, and sends a modern HTML email notification to both admin and the user.

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

    // --- Send Admin Notification Email ---
    const adminRecipient = "";
    const adminSubject = "New Contact Form Submission from " + (e.parameter.name || 'Unknown');
    const adminHtmlBody = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <tr>
                <td align="left" style="padding: 30px 25px;">
                   <a href="https://atikle.github.io/home" target="_blank">
                     <img src="https://atikle.github.io/resource/atikle-logo_multicolor.png" alt="atikle logo" style="width: 20%; min-width: 100px; height: auto; border: 0;">
                   </a>
                </td>
              </tr>
              <tr><td align="center" style="padding: 15px 30px 15px 30px;"><h1 style="font-size: 26px; font-weight: 600; color: #1a202c; margin: 0;">New Form Submission</h1></td></tr>
              <tr><td style="padding: 0 30px;"><hr style="border: 0; border-top: 1px solid #e2e8f0;"></td></tr>
              <tr>
                <td style="padding: 25px 30px 20px 30px;">
                  <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">You've received a new message from <strong>${e.parameter.name || 'Unknown'}</strong>.</p>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">${dataRows}</table>
                  <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin-top: 25px; margin-bottom: 0;">Sincerely,</p>
                  <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin-top: 5px; margin-bottom: 0;">The atikle Help Centre Team</p>
                </td>
              </tr>
              <tr><td align="center" style="padding: 20px 30px; background-color: #ffffff; border-top: 1px solid #e2e8f0; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;"><p style="font-size: 12px; color: #718096; margin: 0;">This is an automated notification. Sent by atikle Help Centre on ${new Date().toLocaleString("en-IN", {timeZone: "Asia/Kolkata"})} IST.</p></td></tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`;
    
    MailApp.sendEmail({ to: adminRecipient, subject: adminSubject, htmlBody: adminHtmlBody, name: "atikle Help Centre Team", replyTo: e.parameter.email });

    // --- Send User Confirmation Email ---
    const userEmail = e.parameter.email;
    if (userEmail) {
      const userSubject = "Confirmation: We've Received Your Message";
      const userHtmlBody = `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 0px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <tr>
                <td align="left" style="padding: 30px 25px;">
                   <a href="https://atikle.github.io/home" target="_blank">
                     <img src="https://atikle.github.io/resource/atikle-logo_multicolor.png" alt="atikle logo" style="width: 20%; min-width: 100px; height: auto; border: 0;">
                   </a>
                </td>
              </tr>
                <tr><td align="center" style="padding: 15px 30px 15px 30px;"><h1 style="font-size: 26px; font-weight: 600; color: #1a202c; margin: 0;">Your Submission Was Received</h1></td></tr>
                <tr><td style="padding: 0 30px;"><hr style="border: 0; border-top: 1px solid #e2e8f0;"></td></tr>
                <tr>
                  <td style="padding: 25px 30px 20px 30px;">
                    <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">Hi ${e.parameter.name || 'there'},<br><br>Thank you for getting in touch! We've received your message and will get back to you shortly. Here is a copy of your submission for your records:</p>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">${dataRows}</table>
                    <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin-top: 25px; margin-bottom: 0;">Sincerely,</p>
                    <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin-top: 5px; margin-bottom: 0;">The atikle Help Centre Team</p>
                  </td>
                </tr>
                <td align="center" style="padding: 20px 30px; background-color: #ffffff; border-top: 1px solid #e2e8f0; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;"><p style="font-size: 12px; color: #718096; margin: 0;">This is an automated notification. Sent by atikle Help Centre on ${new Date().toLocaleString("en-IN", {timeZone: "Asia/Kolkata"})} IST.</p></td>
                <tr><td align="center" style="padding: 20px 30px; background-color: #ffffff; border-top: 1px solid #e2e8f0; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;"><p style="font-size: 12px; color: #718096; margin: 0;">You are receiving this email because you submitted a contact form on atikle Help Centre.</p></td></tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>`;
      MailApp.sendEmail({ to: userEmail, subject: userSubject, htmlBody: userHtmlBody, name: "atikle Help Centre Team" });
    }

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
