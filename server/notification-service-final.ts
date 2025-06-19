import {
  TransactionalEmailsApi,
  SendSmtpEmail,
  TransactionalEmailsApiApiKeys,
} from "@getbrevo/brevo";

// Administrator email to receive notifications
const ADMIN_EMAIL = "info.trend.app@gmail.com";

// Sender email for notifications
const SENDER_EMAIL = "noreply@trend-app.com";
const SENDER_NAME = "Trend App";

// Brevo client configuration
const apiKey = process.env.BREVO_API_KEY;
let apiInstance: TransactionalEmailsApi | null = null;

/**
 * Configure the Brevo API
 */
function setupBrevoApi() {
  if (!apiKey) {
    console.error(
      "Brevo API key not found, user registration notifications won't be sent"
    );
    return false;
  }

  try {
    apiInstance = new TransactionalEmailsApi();
    // Use the correct enum to set the API key
    apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

    console.log("Brevo API initialized successfully - service finalized");
    return true;
  } catch (error) {
    console.error("Failed to initialize Brevo API:", error);
    return false;
  }
}

/**
 * Sends an email notification to the administrator when a new user registers
 * @param userId User ID
 * @param username Username
 * @param email User's email address
 */
export async function sendNewUserNotification(
  userId: number,
  username: string,
  email: string
): Promise<boolean> {
  console.log(
    `Attempting to send notification for new user: ${username} (${email})`
  );
  try {
    // If the API is not configured, try to configure it
    if (!apiInstance && !setupBrevoApi()) {
      console.log("API not configured, attempting to configure it");
      return false;
    }
    console.log("API instance available, proceeding with notification");

    // Formatted registration date
    const registrationDate = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Create the email object
    const sendSmtpEmail = new SendSmtpEmail();

    sendSmtpEmail.subject = `New user registered on Trend: ${username}`;
    sendSmtpEmail.htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #0066cc; border-bottom: 1px solid #eee; padding-bottom: 10px;">New user registered on Trend</h2>
            <p>A new user has registered on the Trend application.</p>
            <h3 style="color: #333; margin-top: 20px;">User details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background-color: #f9f9f9;">
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">User ID:</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${userId}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Username:</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${username}</td>
              </tr>
              <tr style="background-color: #f9f9f9;">
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email:</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Registration date:</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${registrationDate}</td>
              </tr>
            </table>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">This information was sent automatically by the system.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
              Trend - Sentiment Market Tracker
            </div>
          </div>
        </body>
      </html>
    `;

    sendSmtpEmail.sender = {
      name: SENDER_NAME,
      email: SENDER_EMAIL,
    };

    sendSmtpEmail.to = [
      {
        email: ADMIN_EMAIL,
        name: "Admin",
      },
    ];

    // Send the email
    if (apiInstance) {
      console.log(apiInstance);
      console.log("Preparing to send transactional email", sendSmtpEmail);
      try {
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(
          `Notification sent successfully: New user ${username} (${email}) registered`,
          response
        );
        return true;
      } catch (sendError: any) {
        if (
          sendError.statusCode === 401 &&
          sendError.body &&
          sendError.body.message
        ) {
          console.error(
            `Brevo API authorization failed: ${sendError.body.message}`
          );
          console.error(
            "To resolve this issue, log in to your Brevo account and authorize the IP address at: https://app.brevo.com/security/authorised_ips"
          );
        } else {
          console.error(
            "Error sending email:",
            sendError.body.message || sendError.message || "Unknown error"
          );
        }
        return false;
      }
    }
    console.log("API instance not available after setup attempt");
    return false;
  } catch (error) {
    console.error("Error sending new user notification:", error);
    return false;
  }
}

// Service initialization
export function initNotificationService() {
  return setupBrevoApi();
}
