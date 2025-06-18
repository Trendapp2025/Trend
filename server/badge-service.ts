import { log } from './vite';
import { storage } from './storage';

// Function to get the current month in YYYY-MM format
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  // Month is 0-based, so add 1 and ensure two-digit format
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Function to get the previous month in YYYY-MM format
function getPreviousMonth(): string {
  const now = new Date();
  // Set date to the first day of the current month
  now.setDate(1);
  // Subtract one day to get the last day of the previous month
  now.setDate(0);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Function to assign monthly badges based on performance
export async function assignMonthlyBadges(): Promise<void> {
  try {
    const previousMonth = getPreviousMonth();
    log(`Assigning badges for month: ${previousMonth}`, 'badge-service');

    // Assign badges for the previous month
    await storage.assignMonthlyBadges(previousMonth);

    log(`Badges successfully assigned for month: ${previousMonth}`, 'badge-service');
  } catch (error) {
    console.error('Error while assigning monthly badges:', error);
  }
}

// Function to calculate when to run the next badge update (first of every month)
function calculateNextBadgeUpdate(): Date {
  const now = new Date();

  // If it's already the first of the month, schedule for 2 AM today
  if (now.getDate() === 1 && now.getHours() < 2) {
    const target = new Date(now);
    target.setHours(2, 0, 0, 0);
    return target;
  }

  // Otherwise, schedule for the first of next month at 2 AM
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 2, 0, 0, 0);
  return nextMonth;
}

// Schedule the next badge update
function scheduleBadgeUpdate(): void {
  const nextUpdate = calculateNextBadgeUpdate();
  const now = new Date();

  // Calculate the time in milliseconds until the next update
  const timeUntilNextUpdate = nextUpdate.getTime() - now.getTime();

  log(`Next badge update scheduled for: ${nextUpdate.toLocaleString()}`, 'badge-service');

  // Set the timeout for the next update
  setTimeout(() => {
    // Run the badge assignment
    assignMonthlyBadges().then(() => {
      // Schedule the next update
      scheduleBadgeUpdate();
    });
  }, timeUntilNextUpdate);
}

// Main function to start the badge service
export function startBadgeService(): void {
  log('Starting monthly badge assignment service', 'badge-service');

  // Check if it's the first of the month and assign badges immediately if so
  const now = new Date();
  if (now.getDate() === 1) {
    log('It is the first of the month, assigning badges now...', 'badge-service');
    assignMonthlyBadges();
  }

  // Schedule the next update
  scheduleBadgeUpdate();
}
