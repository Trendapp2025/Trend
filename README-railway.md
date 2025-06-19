# Deploy Trend on Railway

## Deployment Steps

1. Sign up on [Railway](https://railway.app/)

2. From the Railway dashboard, click "New Project" and select "Deploy from GitHub repo"

3. Connect your GitHub repository and select the branch to deploy (usually `main`)

4. Configure the following environment variables in the "Variables" panel:
   - `DATABASE_URL`: Use Railway's PostgreSQL service (automatically provided if you add a database)
   - `SESSION_SECRET`: A secure, random string for session management
   - `BREVO_API_KEY`: Your Brevo API key for email services

5. Add a PostgreSQL service by clicking "New" → "Database" → "PostgreSQL"

6. Railway will automatically handle build and deployment using the configuration in the `railway.toml` file

## Monitoring and Logs

- You can monitor logs and metrics from the Railway dashboard
- Railway provides a URL to access the deployed application

## Troubleshooting

If you encounter issues during deployment:

1. Check the logs in the "Deployments" panel
2. Verify that all environment variables are configured correctly
3. Ensure the database has been initialized properly

## Manual Deployment with Railway CLI

Alternatively, you can use the Railway CLI for deployment:

```bash
# Install the Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to the project
railway link

# Deploy
railway up
```