# Vercel Deployment Setup for Google OAuth

## Steps to Fix Google OAuth on Vercel

### 1. Update Environment Variables on Vercel

Go to your Vercel project dashboard and update these environment variables:

```bash
# Replace YOUR_VERCEL_DOMAIN with your actual Vercel domain (e.g., wrapchatapp.vercel.app)
NEXTAUTH_URL=https://YOUR_VERCEL_DOMAIN

# Keep your existing values for these:
NEXTAUTH_SECRET=4727271f952c5e4435d9bae9598c5c99
DATABASE_URL=postgresql://neondb_owner:npg_RuK1ieUxbs6f@ep-jolly-breeze-a1wzqnno-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
GOOGLE_CLIENT_ID=38620923407-2t559n7t18qov654g173irv8o5erke3s.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GEMINI_API_KEY=AIzaSyBi_NH3okm3r7vDaFot5e_9EDWgSQI2K4Q
GIPHY_API_KEY=JitVlsd9QXKTvar7CuPvoNV4NWONIt45
APP_BASE_URL=https://YOUR_VERCEL_DOMAIN
```

### 2. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Find your OAuth 2.0 Client ID
4. In "Authorized redirect URIs", add:
   ```
   https://YOUR_VERCEL_DOMAIN/api/auth/callback/google
   ```
   
   Keep the existing localhost URI for development:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

### 3. Common Issues and Solutions

**Issue**: Login redirects to the same page after fetching details
**Solution**: 
- Ensure `NEXTAUTH_URL` matches your Vercel domain exactly
- Verify Google OAuth redirect URI includes your Vercel domain
- Check that `NEXTAUTH_SECRET` is set and consistent

**Issue**: Authentication works locally but fails on Vercel
**Solution**: 
- Double-check all environment variables are set on Vercel
- Ensure the Google OAuth app is not in testing mode (should be published)
- Verify the Vercel domain is added to Google OAuth authorized domains

### 4. Verification Steps

After making these changes:

1. Redeploy your Vercel app
2. Test Google login on the deployed version
3. Check Vercel function logs if issues persist
4. Verify the redirect URL in browser network tab

### 5. Environment Variable Setup Commands

If using Vercel CLI, you can set variables like this:

```bash
vercel env add NEXTAUTH_URL
# Enter: https://YOUR_VERCEL_DOMAIN

vercel env add NEXTAUTH_SECRET
# Enter: 4727271f952c5e4435d9bae9598c5c99

# And so on for other variables...
```

### 6. Debug Tips

- Check Vercel function logs for auth-related errors
- Enable NextAuth debug mode temporarily by setting `debug: true`
- Verify the OAuth flow in browser developer tools
- Test with an incognito window to avoid cached auth states

## Important Notes

- Replace `YOUR_VERCEL_DOMAIN` with your actual Vercel deployment URL
- Don't include `http://` or `https://` twice in the URLs
- Make sure Google OAuth app is set to "Production" if you have real users
- Environment variables on Vercel need to be set through the dashboard or CLI, not the .env.local file
