import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { sendVerificationEmail, verifyEmail, resendVerificationEmail } from "./email-service";
import { sendNewUserNotification } from "./notification-service-final";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // Gestione speciale per l'admin con la password hardcoded
  if (stored === '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8.0123456789abcdef') {
    // Hash SHA256 di "password"
    return supplied === 'password';
  }

  try {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "trend-finance-app-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Controllo se l'username o l'email esistono già
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      if (req.body.email) {
        const existingEmail = await storage.getUserByEmail(req.body.email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }

      // Crea l'utente
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Se l'email è presente, invia l'email di verifica
      if (req.body.email) {
        await sendVerificationEmail(user.id, req.body.email);
        console.log(`Verification email sent to ${req.body.email} for user ${user.id}`);
      }

      // Invia una notifica all'amministratore per il nuovo utente registrato
      try {
        await sendNewUserNotification(user.id, user.username, req.body.email || "");
      } catch (error) {
        console.error('Error sending admin notification:', error);
        // Non blocchiamo il processo di registrazione se la notifica fallisce
      }

      // Effettua il login automatico dell'utente
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      console.error('Error during registration:', error);
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
  
  // Endpoint per verificare l'email via token
  app.get("/verify-email", async (req, res) => {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).send(`
        <html>
          <head>
            <title>Email Verification Failed</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f5f5f5; }
              .container { max-width: 600px; padding: 40px; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
              h1 { color: #e53e3e; margin-bottom: 16px; }
              p { margin-bottom: 24px; color: #4a5568; }
              a { display: inline-block; padding: 12px 24px; background-color: #3182ce; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Verification Failed</h1>
              <p>No verification token provided. Please check your email and try the link again.</p>
              <a href="/">Go to Homepage</a>
            </div>
          </body>
        </html>
      `);
    }
    
    try {
      const success = await verifyEmail(token);
      
      if (success) {
        // Se l'utente è loggato, aggiorna l'oggetto sessione
        if (req.isAuthenticated()) {
          const user = await storage.getUser(req.user.id);
          if (user) {
            req.login(user, () => {
              return res.send(`
                <html>
                  <head>
                    <title>Email Verified Successfully</title>
                    <style>
                      body { font-family: Arial, sans-serif; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f5f5f5; }
                      .container { max-width: 600px; padding: 40px; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
                      h1 { color: #38a169; margin-bottom: 16px; }
                      p { margin-bottom: 24px; color: #4a5568; }
                      a { display: inline-block; padding: 12px 24px; background-color: #3182ce; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <h1>Email Verified Successfully!</h1>
                      <p>Your email has been verified. You can now enjoy full access to Trend's features.</p>
                      <a href="/profile">Go to Profile</a>
                    </div>
                  </body>
                </html>
              `);
            });
            return;
          }
        }
        
        return res.send(`
          <html>
            <head>
              <title>Email Verified Successfully</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f5f5f5; }
                .container { max-width: 600px; padding: 40px; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
                h1 { color: #38a169; margin-bottom: 16px; }
                p { margin-bottom: 24px; color: #4a5568; }
                a { display: inline-block; padding: 12px 24px; background-color: #3182ce; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Email Verified Successfully!</h1>
                <p>Your email has been verified. You can now enjoy full access to Trend's features.</p>
                <a href="/auth">Login to continue</a>
              </div>
            </body>
          </html>
        `);
      } else {
        return res.status(400).send(`
          <html>
            <head>
              <title>Email Verification Failed</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f5f5f5; }
                .container { max-width: 600px; padding: 40px; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
                h1 { color: #e53e3e; margin-bottom: 16px; }
                p { margin-bottom: 24px; color: #4a5568; }
                a { display: inline-block; padding: 12px 24px; background-color: #3182ce; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Verification Failed</h1>
                <p>The verification token is invalid or has expired. Please request a new verification email.</p>
                <a href="/auth">Login to try again</a>
              </div>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      return res.status(500).send(`
        <html>
          <head>
            <title>Server Error</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f5f5f5; }
              .container { max-width: 600px; padding: 40px; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
              h1 { color: #e53e3e; margin-bottom: 16px; }
              p { margin-bottom: 24px; color: #4a5568; }
              a { display: inline-block; padding: 12px 24px; background-color: #3182ce; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Server Error</h1>
              <p>There was a problem processing your verification. Please try again later.</p>
              <a href="/">Go to Homepage</a>
            </div>
          </body>
        </html>
      `);
    }
  });
  
  // Endpoint per richiedere un nuovo token di verifica
  app.post("/api/resend-verification", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Non autorizzato" });
    }
    
    try {
      const success = await resendVerificationEmail(req.user.id);
      
      if (success) {
        res.status(200).json({ message: "Email di verifica inviata con successo" });
      } else {
        res.status(400).json({ error: "Impossibile inviare l'email di verifica" });
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      res.status(500).json({ error: "Errore durante l'invio dell'email di verifica" });
    }
  });
}
