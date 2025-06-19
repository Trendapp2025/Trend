# Trend - Market Sentiment Tracking Application

## Description
Trend is a full-stack web application that allows users to track, share, and analyze market sentiment on financial assets such as stocks and cryptocurrencies. Users can register, submit their predictions, earn badges based on accuracy, and compete in a monthly leaderboard.

## Technologies Used
- **Frontend**: React, TypeScript, Shadcn UI, TanStack Query, Zod
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Email**: Integration with Brevo API

## Main Features
- Real-time community sentiment monitoring
- Prediction system with percentage ratings
- Monthly badges for accurate predictors
- User profiles with badge and prediction history
- Admin panel
- Multilanguage support (Italian/English)
- Light/Dark theme

## Installation Requirements
1. Node.js v16 or higher
2. PostgreSQL 14 or higher
3. Brevo account for email services (optional but recommended)

## Installation Instructions

### Database Configuration
```bash
# Create a PostgreSQL database
createdb trend

# Set environment variables
export DATABASE_URL=postgresql://username:password@localhost:5432/trend
export SESSION_SECRET=your_session_secret
export BREVO_API_KEY=your_brevo_api_key
```

### Install Dependencies
```bash
# Install dependencies
npm install

# Run database migration
npm run db:push
```

### Start the Application
```bash
# Start the development server
npm run dev

# Build for production
npm run build
npm start
```

## Project Structure
- `/client` - React frontend code
- `/server` - Express backend API
- `/shared` - Shared types and schemas
- `/scripts` - Utility scripts

## Application Access
The application will be available at http://localhost:5000

The default admin user is:
- Username: admin
- Password: password

## Main Features
- **Main Dashboard**: View assets with their current sentiment
- **User Profile**: View user badges and predictions
- **Asset Detail**: Shows detailed information and allows submitting predictions
- **Admin Panel**: User management and system monitoring
- **Multilanguage Support**: Switch between Italian and English
- **Light/Dark Theme**: Customize the user interface

## License
All rights reserved.
