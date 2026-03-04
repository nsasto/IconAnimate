# IconoAnimate - AI Icon Studio

IconoAnimate is a premium AI icon generator that creates 3D isometric icons and banners, then animates them into seamless loops. It runs on React + Vite and uses Google Gemini for image generation and Veo for video animation.

## Features

- Generate 3D isometric icons or wide banners from text prompts
- Custom style controls: palette, lighting, arrangement, and tone
- One-click animation with guided motion prompts
- Gallery with download links for PNG/MP4 outputs

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Google GenAI SDK (`gemini-2.5-flash-image` and `veo-3.1-fast-generate-preview`)

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   `npm install`
2. Create `.env.local` and set your API key:
   `GEMINI_API_KEY=your_key_here`
3. Start the dev server:
   `npm run dev`

The app will be available at `http://localhost:3000`.

## Deploy to Cloudflare Pages

This is a static Vite app, so it can be deployed directly to Cloudflare Pages.

1. Push this repo to GitHub (or GitLab).
2. In Cloudflare Pages, create a new project and connect the repo.
3. Use these build settings:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add an environment variable:
   - `GEMINI_API_KEY` = your Gemini API key
5. Deploy.

Cloudflare Pages will serve the built site and inject `GEMINI_API_KEY` at build time.

## AI Studio Notes

- The UI prompts you to select a paid API key when running inside AI Studio.
- Video generation requires a paid GCP project with Veo access.

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview the production build

## Project Structure

- `App.tsx` - main UI, generation flow, and gallery
- `components/` - modal, key notice, settings menu
- `services/gemini.ts` - Gemini/Veo requests and polling
- `types.ts` - shared types and style JSON builder
