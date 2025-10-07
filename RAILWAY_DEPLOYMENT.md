# Railway Deployment Guide

This guide will walk you through deploying the SentimentAI backend to Railway.app and updating the frontend configuration.

## Prerequisites

- Railway.app account (sign up at https://railway.app)
- GitHub repository (optional but recommended)
- All environment variables ready

## Step 1: Prepare Backend for Railway

The following files have been created in the `voice-server` directory:

1. **`railway.json`** - Railway configuration file
2. **`Procfile`** - Process definition for Railway
3. **`.railwayignore`** - Files to exclude from deployment

## Step 2: Deploy Backend to Railway

### Option A: Deploy via GitHub (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add Railway deployment configuration"
   git push origin main
   ```

2. Go to [Railway.app](https://railway.app) and click **"New Project"**

3. Select **"Deploy from GitHub repo"**

4. Choose your repository and select the `voice-server` directory as the root path

5. Railway will automatically detect the configuration and start building

### Option B: Deploy via Railway CLI

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Navigate to the voice-server directory:
   ```bash
   cd voice-server
   ```

4. Initialize Railway project:
   ```bash
   railway init
   ```

5. Deploy:
   ```bash
   railway up
   ```

## Step 3: Configure Environment Variables on Railway

In the Railway dashboard:

1. Go to your project → **Variables** tab

2. Add the following environment variables:

   ```
   OPENAI_API_KEY=sk-proj-...
   PORT=3001
   NODE_ENV=production
   ALLOWED_ORIGINS=https://sentimentai.tech
   ASSEMBLYAI_API_KEY=18e39....
   AWS_ACCESS_KEY_ID=AKIA.....
   AWS_SECRET_ACCESS_KEY=yQZhf....
   AWS_REGION=eu-north-1
   SES_FROM_EMAIL=info@sentimentAI.tech
   SES_TO_EMAIL=sentimentAI1@outlook.com
   ```

3. Click **"Deploy"** to restart with new variables

## Step 4: Get Your Railway URL

1. After deployment completes, go to **Settings** → **Domains**

2. Railway will provide a URL like: `https://your-project-name.railway.app`

3. Copy this URL - you'll need it for the frontend

## Step 5: Update Frontend Configuration

1. Open `.env.production` in the root directory

2. Replace `your-railway-backend.railway.app` with your actual Railway URL:

   ```bash
   # Railway Backend URL
   NEXT_PUBLIC_WS_URL=wss://your-actual-railway-url.railway.app/ws/voice-chat
   NEXT_PUBLIC_API_URL=https://your-actual-railway-url.railway.app
   ```

## Step 6: Test the Backend

Test your Railway backend endpoints:

1. **Health check**:
   ```bash
   curl https://your-railway-url.railway.app/health
   ```

2. **Contact form** (test email sending):
   ```bash
   curl -X POST https://your-railway-url.railway.app/api/contact \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "company": "Test Company",
       "message": "This is a test message"
     }'
   ```

3. **WebSocket** (test in browser console on your site):
   ```javascript
   const ws = new WebSocket('wss://your-railway-url.railway.app/ws/voice-chat');
   ws.onopen = () => console.log('Connected!');
   ws.onerror = (error) => console.error('Error:', error);
   ```

## Step 7: Build and Deploy Frontend

1. Build the frontend with production environment:
   ```bash
   npm run build
   ```

2. The build output will be in the `out` directory

3. Upload to Hostinger:
   - Login to Hostinger control panel
   - Navigate to File Manager
   - Upload contents of `out` directory to `public_html`

## Step 8: Verify Everything Works

Test all features on your live site:

1. ✅ **Voice Chat**: Click the microphone button and test voice interaction
2. ✅ **Contact Form**: Submit the contact form and verify emails are sent
3. ✅ **OpenAI Integration**: Verify AI responses work correctly

## Troubleshooting

### Backend not starting
- Check Railway logs in the dashboard
- Verify all environment variables are set correctly
- Ensure `PORT` is set to 3001

### WebSocket connection failing
- Verify the WebSocket URL uses `wss://` (not `http://`)
- Check CORS settings in `ALLOWED_ORIGINS`
- Check Railway logs for connection errors

### Emails not sending
- Verify AWS SES credentials are correct
- Check `AWS_REGION` is set to `eu-north-1`
- Verify sender email is verified in AWS SES
- Check Railway logs for AWS SES errors

### Frontend can't reach backend
- Verify `NEXT_PUBLIC_API_URL` in `.env.production` matches Railway URL
- Rebuild frontend after changing environment variables
- Check browser console for CORS errors

## Updating the Deployment

To update the backend:

1. Make your changes to the code
2. Commit and push to GitHub (if using GitHub deployment)
3. Railway will automatically redeploy

Or use Railway CLI:
```bash
cd voice-server
railway up
```

To update the frontend:

1. Make your changes
2. Rebuild: `npm run build`
3. Upload new `out` directory contents to Hostinger

## Monitoring

Monitor your Railway deployment:

1. **Logs**: Railway dashboard → **Deployments** → Click on deployment → **View Logs**
2. **Metrics**: Railway dashboard → **Metrics** tab
3. **Cost**: Railway dashboard → **Usage** tab

## Notes

- Railway provides 500 hours/month free tier
- WebSocket connections are fully supported on Railway
- Environment variables can be updated anytime in the Railway dashboard
- Railway automatically handles SSL certificates for HTTPS/WSS

## Support

If you encounter issues:

1. Check Railway documentation: https://docs.railway.app
2. Review Railway logs for error messages
3. Verify all environment variables are correctly set
4. Test backend endpoints independently before testing with frontend
