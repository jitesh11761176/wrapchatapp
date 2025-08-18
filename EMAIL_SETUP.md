# Email Configuration for Forgot Password Feature

## Overview
The forgot password feature has been successfully implemented! This document explains how to configure email functionality.

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com  # Optional, defaults to EMAIL_USER
```

## Gmail Setup (Recommended for development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Navigate to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password (not your regular password) in `EMAIL_PASSWORD`

## Other Email Providers

### Outlook/Hotmail
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Custom SMTP
```bash
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587  # or 465 for SSL
EMAIL_USER=your-username
EMAIL_PASSWORD=your-password
```

## Development Mode

If you don't configure email settings, the forgot password feature will:
- Still work for testing
- Log the reset URL to the console instead of sending emails
- Show this in your terminal: `🔗 Password Reset URL: http://localhost:3000/auth/reset-password?token=...`

## How It Works

1. **User requests password reset** → Visits `/auth/forgot-password`
2. **System generates secure token** → Stores in database with 1-hour expiration
3. **Email sent with reset link** → Contains the secure token
4. **User clicks link** → Visits `/auth/reset-password?token=...`
5. **User enters new password** → Token is validated and password updated
6. **Token is cleared** → One-time use security

## Security Features

- ✅ **Secure token generation** using crypto.randomBytes(32)
- ✅ **Token expiration** (1 hour)
- ✅ **One-time use tokens** (cleared after use)
- ✅ **No user existence disclosure** (same message for valid/invalid emails)
- ✅ **Password hashing** with bcryptjs
- ✅ **Input validation** (minimum 6 characters)

## Testing

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000/auth/signin`
3. Click "Forgot your password?"
4. Enter your email address
5. Check console for reset URL (if no email configured) or check your email
6. Follow the reset link and set a new password

## Troubleshooting

**Email not sending?**
- Check your environment variables
- Verify email credentials
- Check console for error messages
- Try using the console URL for testing

**Token expired error?**
- Reset tokens expire after 1 hour
- Request a new password reset

**Invalid token error?**
- Tokens can only be used once
- Make sure you're using the complete URL from the email
