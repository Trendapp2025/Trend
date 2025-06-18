import { randomBytes } from 'crypto';
import { db } from './db';
import { emailVerifications, users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { MailService } from '@sendgrid/mail';
// Set this to true to simulate sending the verification email
// without actually sending it (useful for testing and development)
const SIMULATE_EMAIL_SENDING = true;

let mailService: MailService | null = null;

// Initialize SendGrid if the API Key is available
export function initEmailService() {
  if (process.env.SENDGRID_API_KEY) {
    mailService = new MailService();
    mailService.setApiKey(process.env.SENDGRID_API_KEY);
    console.log("Email service initialized with SendGrid");
  } else {
    console.log("SendGrid API key not found, email sending will be simulated");
  }
}

// Generate a random token for email verification
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

// Create an email verification record and send the email
export async function sendVerificationEmail(userId: number, email: string): Promise<boolean> {
  try {
    // Generate a token and set an expiry of 48 hours
    const token = generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
    
    // Save the verification record in the database
    await db.insert(emailVerifications).values({
      userId,
      email,
      token,
      expiresAt,
    });
    
    // Also update the user's data
    await db.update(users)
      .set({ 
        email,
        verificationToken: token,
        verificationTokenExpiry: expiresAt 
      })
      .where(eq(users.id, userId));
    
    // Build the verification URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    
    if (SIMULATE_EMAIL_SENDING || !mailService) {
      // Simulate sending the email and log the verification URL for testing purposes
      console.log(`[Email Service] Verification email would be sent to ${email}`);
      console.log(`[Email Service] Verification URL: ${verificationUrl}`);
      return true;
    }
    
    // Send the email using SendGrid
    await mailService.send({
      to: email,
      from: 'noreply@trend.app', // Replace with the actual sender email
      subject: 'Verify your email address for Trend',
      text: `Thank you for registering with Trend. Please verify your email address by clicking the following link: ${verificationUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Trend!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify your Email
            </a>
          </div>
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p>This link will expire in 48 hours.</p>
          <p>Thank you,<br>The Trend Team</p>
        </div>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

// Verify an email verification token
export async function verifyEmail(token: string): Promise<boolean> {
  try {
    // Find the verification record matching the token
    const [verification] = await db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.token, token));
    
    if (!verification) {
      return false;
    }
    
    // Check if the token has expired
    if (new Date() > verification.expiresAt) {
      return false;
    }
    
    // Update verification status
    await db
      .update(emailVerifications)
      .set({ verified: true })
      .where(eq(emailVerifications.id, verification.id));
    
    // Update the user's verification status
    await db
      .update(users)
      .set({ 
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      })
      .where(eq(users.id, verification.userId));
    
    return true;
  } catch (error) {
    console.error('Error verifying email:', error);
    return false;
  }
}

// Request a new verification email
export async function resendVerificationEmail(userId: number): Promise<boolean> {
  try {
    // Get user information
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user || !user.email) {
      return false;
    }
    
    // Delete existing verifications for the user
    await db
      .delete(emailVerifications)
      .where(eq(emailVerifications.userId, userId));
    
    // Send a new verification email
    return await sendVerificationEmail(userId, user.email);
  } catch (error) {
    console.error('Error resending verification email:', error);
    return false;
  }
}
