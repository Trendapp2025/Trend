import { randomBytes } from 'crypto';
import { db } from './db';
import { emailVerifications, users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { MailService } from '@sendgrid/mail';

// Imposta questo a true per simulare l'invio dell'email di verifica
// senza effettivamente inviarla (utile per test e sviluppo)
const SIMULATE_EMAIL_SENDING = true;

let mailService: MailService | null = null;

// Inizializza SendGrid se la API Key è disponibile
export function initEmailService() {
  if (process.env.SENDGRID_API_KEY) {
    mailService = new MailService();
    mailService.setApiKey(process.env.SENDGRID_API_KEY);
    console.log("Email service initialized with SendGrid");
  } else {
    console.log("SendGrid API key not found, email sending will be simulated");
  }
}

// Genera un token casuale per la verifica email
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

// Crea un record di verifica email e invia l'email
export async function sendVerificationEmail(userId: number, email: string): Promise<boolean> {
  try {
    // Genera un token e imposta una scadenza tra 48 ore
    const token = generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
    
    // Salva il record di verifica nel database
    await db.insert(emailVerifications).values({
      userId,
      email,
      token,
      expiresAt,
    });
    
    // Aggiorna anche i dati dell'utente
    await db.update(users)
      .set({ 
        email,
        verificationToken: token,
        verificationTokenExpiry: expiresAt 
      })
      .where(eq(users.id, userId));
    
    // Costruisci l'URL di verifica
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    
    if (SIMULATE_EMAIL_SENDING || !mailService) {
      // Simula l'invio dell'email e registra l'URL di verifica per scopi di test
      console.log(`[Email Service] Verification email would be sent to ${email}`);
      console.log(`[Email Service] Verification URL: ${verificationUrl}`);
      return true;
    }
    
    // Invia l'email utilizzando SendGrid
    await mailService.send({
      to: email,
      from: 'noreply@trend.app', // Sostituisci con l'email effettiva del mittente
      subject: 'Verifica il tuo indirizzo email per Trend',
      text: `Grazie per esserti registrato su Trend. Per favore, verifica il tuo indirizzo email cliccando sul seguente link: ${verificationUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Benvenuto su Trend!</h2>
          <p>Grazie per esserti registrato. Per favore, verifica il tuo indirizzo email cliccando sul pulsante qui sotto:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verifica la tua Email
            </a>
          </div>
          <p>Se il pulsante non funziona, puoi anche copiare e incollare il seguente link nel tuo browser:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p>Questo link scadrà tra 48 ore.</p>
          <p>Grazie,<br>Il team di Trend</p>
        </div>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

// Verifica un token di verifica email
export async function verifyEmail(token: string): Promise<boolean> {
  try {
    // Trova la verifica corrispondente al token
    const [verification] = await db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.token, token));
    
    if (!verification) {
      return false;
    }
    
    // Controlla se il token è scaduto
    if (new Date() > verification.expiresAt) {
      return false;
    }
    
    // Aggiorna lo stato di verifica
    await db
      .update(emailVerifications)
      .set({ verified: true })
      .where(eq(emailVerifications.id, verification.id));
    
    // Aggiorna lo stato di verifica dell'utente
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

// Richiedi una nuova email di verifica
export async function resendVerificationEmail(userId: number): Promise<boolean> {
  try {
    // Ottieni le informazioni sull'utente
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user || !user.email) {
      return false;
    }
    
    // Cancella le verifiche esistenti per l'utente
    await db
      .delete(emailVerifications)
      .where(eq(emailVerifications.userId, userId));
    
    // Invia una nuova email di verifica
    return await sendVerificationEmail(userId, user.email);
  } catch (error) {
    console.error('Error resending verification email:', error);
    return false;
  }
}