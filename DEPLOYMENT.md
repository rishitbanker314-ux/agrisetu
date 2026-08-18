# AgriSetu Frontend Deployment Guide

Because AgriSetu is built on Next.js 14, Vercel is the recommended hosting platform for a zero-configuration deployment.

## Steps to Deploy on Vercel

1. Push your local repository to GitHub, GitLab, or Bitbucket.
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your AgriSetu repository.
4. **Environment Variables**: You must add the following variables before clicking deploy:

   | Variable Name | Description |
   | ------------- | ----------- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Public Key |

   *Note: Do NOT add your `GEMINI_API_KEY` here. That key belongs securely in the Supabase Edge Functions secrets.*

5. Click **Deploy**. Vercel will automatically detect the Next.js framework, build the application, and serve the Progressive Web App (PWA) assets.

## Netlify Alternative
If you prefer Netlify, simply import the repository into Netlify. It will automatically use the `@netlify/plugin-nextjs` to build and deploy the app. The same environment variables apply.
