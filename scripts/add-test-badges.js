// Script to add test badges to the admin user
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { userBadges, users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

neonConfig.webSocketConstructor = ws;

// Connection to database
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: { userBadges, users } });

const ADMIN_USERNAME = 'admin';
const CURRENT_YEAR = new Date().getFullYear();

async function main() {
  try {
    console.log('Add the badge to test all users admin...');

    // Find the admin user
    const [adminUser] = await db.select().from(users).where(eq(users.username, ADMIN_USERNAME));
    
    if (!adminUser) {
      console.error('Admin user not found!');
      process.exit(1);
    }

    // Check if there are already badges for the admin user
    const existingBadges = await db.select().from(userBadges).where(eq(userBadges.userId, adminUser.id));
    
    if (existingBadges.length > 0) {
      console.log(`Found ${existingBadges.length} existing badges for the admin user.`);
      console.log('Operation canceled. If you want to add new badges, please delete the existing ones first.');
      process.exit(0);
    }

    // Sample badges for the last months
    const sampleBadges = [
      {
        userId: adminUser.id,
        username: adminUser.username,
        badgeType: 'top1',
        monthYear: `${CURRENT_YEAR-1}-12`,
        accuracyPercentage: 92.5,
        totalPredictions: 40
      },
      {
        userId: adminUser.id,
        username: adminUser.username,
        badgeType: 'top2',
        monthYear: `${CURRENT_YEAR}-01`,
        accuracyPercentage: 87.3,
        totalPredictions: 32
      },
      {
        userId: adminUser.id,
        username: adminUser.username,
        badgeType: 'top3',
        monthYear: `${CURRENT_YEAR}-02`,
        accuracyPercentage: 82.1,
        totalPredictions: 28
      }
    ];
    
    // Insert the badges
    const insertedBadges = await db.insert(userBadges).values(sampleBadges).returning();
    console.log(`Inserted ${insertedBadges.length} test badges.`);

    // Update the current badge of the admin user
    await db.update(users)
      .set({ currentBadge: 'top3' })
      .where(eq(users.id, adminUser.id));

    console.log('Current badge of the admin user set to "top3"');
    console.log('Operation completed successfully!');
  } catch (error) {
    console.error('Error while adding test badges:', error);
    process.exit(1);
  }
}

main();