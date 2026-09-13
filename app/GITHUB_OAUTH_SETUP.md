# GitHub OAuth App Setup Instructions

Your GitHub OAuth app needs these exact settings:

## Application Settings

1. Go to https://github.com/settings/developers
2. Click on your OAuth App (or create a new one)
3. Set these values:

**Homepage URL:**

```
http://localhost:3000
```

**Authorization callback URL:**

```
http://localhost:3000/api/auth/callback/github
```

## Important Notes

- The callback URL MUST be exactly `http://localhost:3000/api/auth/callback/github`
- Make sure your GITHUB_ID and GITHUB_SECRET in .env match the app
- After updating callback URL, wait a few seconds and try again

## Testing

1. Click "Continue with GitHub" on /signin page
2. You should be redirected to GitHub authorization page
3. After authorizing, you'll be redirected back to /dashboard

## If it still doesn't work:

1. Open browser console (F12) and check for errors
2. Look at the Network tab to see what requests are being made
3. Check the server terminal for any error messages
