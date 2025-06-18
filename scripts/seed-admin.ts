// Script to create the admin user in the database if it does not exist
import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Same password hash function used in auth.ts
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedAdmin() {
  try {
    console.log('Checking if the admin user already exists...');

    // Check if the admin user already exists
    const existingAdmin = await db.select()
      .from(users)
      .where(eq(users.username, 'admin'))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('The admin user already exists, no action needed.');
      return;
    }

    console.log('Creating admin user...');

    // Define the default password for the admin user (to be changed after first login)
    const plainPassword = 'TrendAdmin2025!'; // Make sure to change this password in production!

    // Alternatively, you can use the hardcoded "password" as in auth.ts
    // This is the SHA256 hash for "password" specified in auth.ts
    const hardcodedHash = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8.0123456789abcdef';

    // Hash the password using the same method as in auth.ts
    const hashedPassword = await hashPassword(plainPassword);

    // Insert the admin user
    const [adminUser] = await db.insert(users).values({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@trend-app.com',
      emailVerified: true,
      isVerifiedAdvisor: true,
      bio: 'Administrator of the Trend platform',
      totalPredictions: 0,
      accuratePredictions: 0,
      accuracyPercentage: "0",
      advisorRating: "5.0"
    }).returning();

    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: ' + plainPassword);
    console.log('IMPORTANT: Change this password after the first login!');

  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the function
seedAdmin().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
