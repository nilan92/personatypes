## Persona Atlas

This is a Next.js app for running personality assessments with Google sign-in
through Neon Auth. It currently stores completed assessment results in the
browser.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Fill in the required values in `.env.local`.

4. Start the app:

```bash
npm run dev
```

5. Open `https://localhost:3000`.

## Environment Variables

- `NEXT_PUBLIC_NEON_AUTH_URL`: Neon Auth URL for your project.
- `NEON_AUTH_COOKIE_SECRET`: long random secret used to sign auth cookies.
- `NEXT_PUBLIC_GOOGLE_ADSENSE_ID`: optional. If unset, the ad slot is hidden.

## Recommended Hosting

- App hosting: Vercel
- Auth: Neon Auth
- Database for future persistence: Neon Postgres

## Vercel Deployment

1. Push the `pim-app` folder to a GitHub repository.
2. Import the repository into Vercel.
3. Add the environment variables from `.env.example` in Vercel project settings.
4. Deploy the project.
5. In Neon Auth, make sure your production domain is allowed for auth callbacks.

## Current Limitations

- Assessment results are stored in local storage, so they are browser-specific.
- Google AdSense only appears after you set a real publisher ID.
- If you want multi-device history, the next step is saving results to Neon
  Postgres instead of local storage.
