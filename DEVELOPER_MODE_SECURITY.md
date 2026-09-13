# 🔒 Securing Developer Mode

## Setup for Production

### 1. Add Your Email to Environment Variables

**Local Development (.env):**

```env
DEVELOPER_EMAILS="your-email@gmail.com,admin@company.com"
```

**Production (Vercel/Netlify):**
Add this environment variable in your hosting dashboard:

- Variable: `DEVELOPER_EMAILS`
- Value: `your-email@gmail.com,admin@company.com`

### 2. How It Works

✅ **Security Features:**

- Developer mode toggle **only shows** to authorized users
- Email verification happens server-side (can't be bypassed)
- Checks against `DEVELOPER_EMAILS` env variable
- Unauthorized users **never see** the toggle button
- LocalStorage cleared if user is not authorized

✅ **Authorization Flow:**

1. User signs in with email
2. System checks if email is in `DEVELOPER_EMAILS` list
3. If authorized → Shows dev mode toggle in sidebar
4. If not authorized → No toggle, no access

### 3. Testing

**As Developer (authorized):**

- Sign in with email in `DEVELOPER_EMAILS`
- See "DEV MODE" toggle button at bottom of sidebar
- Toggle ON → All premium features unlocked

**As Client (unauthorized):**

- Sign in with any other email
- Toggle button is **completely hidden**
- All payment gates work normally

### 4. Adding/Removing Developers

Just update the environment variable:

```env
# Add developers (comma-separated)
DEVELOPER_EMAILS="dev1@email.com,dev2@email.com,admin@email.com"
```

No code changes needed! Restart your app after updating env vars.

### 5. Production Deployment

**Before deploying:**

1. ✅ Add `DEVELOPER_EMAILS` to production env vars
2. ✅ Use your actual work email(s)
3. ✅ Keep the list private (don't commit to git)

**Example for Vercel:**

```
Settings → Environment Variables → Add:
Name: DEVELOPER_EMAILS
Value: your-production-email@company.com
```

## 🔐 Security Best Practices

- ✅ Environment variable is server-side only
- ✅ Client can't manipulate the check
- ✅ Console attempts logged (for monitoring abuse)
- ✅ Toggle removed entirely for unauthorized users
- ✅ No way to bypass without server access

Regular users will never know developer mode exists!
