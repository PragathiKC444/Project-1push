# Grama-Urja Web

A lightweight React + Vite version of the Grama-Urja app, ready for local development and static deployment.

## Local development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Or:

```bash
npm start
```

Build for production:

```bash
npm run build
```

## Static deployment

### Netlify

This project includes `netlify.toml`, so Netlify will use:

- Build command: `npm run build`
- Publish directory: `dist`

To deploy:

1. Connect your Git repository to Netlify.
2. Select the root folder of this project.
3. Confirm the build command and publish directory.
4. Deploy.

### Vercel

This project includes `vercel.json`, so Vercel will use:

- Build command: `npm run build`
- Output directory: `dist`

To deploy:

1. Install the Vercel CLI: `npm install -g vercel` (optional).
2. Run `vercel` from the project root.
3. Follow the prompts to connect your account and deploy.

## Notes

- The app is a static single-page app built with Vite.
- If you want me to create a GitHub Actions workflow for automatic deploys, I can add that too.
