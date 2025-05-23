// Script per creare l'utente admin nel database se non esiste
import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Stessa funzione di hash password usata in auth.ts
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedAdmin() {
  try {
    console.log('Controllo se l\'utente admin esiste già...');
    
    // Verifica se l'utente admin esiste già
    const existingAdmin = await db.select()
      .from(users)
      .where(eq(users.username, 'admin'))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('L\'utente admin esiste già, nessuna operazione necessaria.');
      return;
    }
    
    console.log('Creazione utente admin in corso...');
    
    // Definisci la password di default per l'utente admin (da modificare dopo il primo accesso)
    const plainPassword = 'TrendAdmin2025!'; // Assicurati di cambiare questa password in produzione!
    
    // Alternativamente, è possibile usare la password hardcoded "password" come nell'auth.ts
    // Questo è l'hash SHA256 per "password" specificato in auth.ts
    const hardcodedHash = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8.0123456789abcdef';
    
    // Hash della password usando lo stesso metodo di auth.ts
    const hashedPassword = await hashPassword(plainPassword);
    
    // Inserisci l'utente admin
    const [adminUser] = await db.insert(users).values({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@trend-app.com',
      emailVerified: true,
      isVerifiedAdvisor: true,
      bio: 'Amministratore della piattaforma Trend',
      totalPredictions: 0,
      accuratePredictions: 0,
      accuracyPercentage: "0",
      advisorRating: "5.0"
    }).returning();
    
    console.log('Utente admin creato con successo!');
    console.log('Username: admin');
    console.log('Password: ' + plainPassword);
    console.log('IMPORTANTE: Cambia questa password dopo il primo accesso!');
    
  } catch (error) {
    console.error('Errore durante la creazione dell\'utente admin:', error);
    process.exit(1);
  }
}

// Esegui la funzione
seedAdmin().catch(err => {
  console.error('Errore non gestito:', err);
  process.exit(1);
});
