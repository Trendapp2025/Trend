import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';

// Brevo client configuration
const apiKey = process.env.BREVO_API_KEY;
let apiInstance: TransactionalEmailsApi;

// Administrator email to receive notifications
// Use the address provided by the user
const ADMIN_EMAIL = "info.trend.app@gmail.com"; 

// Sender email for notifications
const SENDER_EMAIL = "noreply@trend-app.com";
const SENDER_NAME = "Trend App";

// Brevo API setup
function setupBrevoApi() {
  if (!apiKey) {
    console.error("Brevo API key not found, user registration notifications won't be sent");
    return false;
  }

  apiInstance = new TransactionalEmailsApi();

  // Old way to set the API key
  // Set up the client with the apiKey
  // apiInstance.setApiKey('api-key', apiKey);
  
  // Refactored to use the enum for setting the API key
  apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  return true;
}

/**
 * Sends an email notification to the administrator when a new user registers
 * @param userId User ID
 * @param username Username
 * @param email User's email address
 */
export async function sendNewUserNotification(userId: number, username: string, email: string): Promise<boolean> {
  try {
    // If the API is not configured, try to configure it
    if (!apiInstance && !setupBrevoApi()) {
      return false;
    }

    // Formatted registration date
    const registrationDate = new Date().toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });

    // Create the email object
    const sendSmtpEmail = new SendSmtpEmail();
    
    sendSmtpEmail.subject = `New user registered on Trend: ${username}`;
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h2>New user registered on Trend</h2>
          <p>A new user has registered on the Trend application.</p>
          <h3>User details:</h3>
          <ul>
            <li><strong>User ID:</strong> ${userId}</li>
            <li><strong>Username:</strong> ${username}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Password:</strong> [HIDDEN FOR SECURITY]</li>
            <li><strong>Registration date:</strong> ${registrationDate}</li>
          </ul>
          <p>This information was sent automatically by the system.</p>
          <p>Trend - Sentiment Market Tracker</p>
        </body>
      </html>
    `;
    
    sendSmtpEmail.sender = {
      name: SENDER_NAME,
      email: SENDER_EMAIL
    };
    
    sendSmtpEmail.to = [{
      email: ADMIN_EMAIL,
      name: 'Admin'
    }];

    // Send the email
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Notification sent: New user ${username} (${email}) registered`);
    return true;
  } catch (error) {
    console.error('Error sending new user notification:', error);
    return false;
  }
}

// Service initialization
export function initNotificationService() {
  return setupBrevoApi();
}