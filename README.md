<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ZxSpZ3j2AqvYDjauW-aW78J2KX5dB31u

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

### Multiplayer server

The polling server lives in [`server/server.js`](server/server.js) with full
setup details in [`server/README.md`](server/README.md). It keeps a shared
`chatlog.txt` file up to date with every player's position and recent chat
messages so that each client can poll updates every five seconds. To run it
locally while developing the client, launch it in a separate terminal:

```bash
npm start
```

The server listens on port `8080` by default and exposes simple JSON endpoints
(`GET /chatlog.txt`, `GET /state`, `POST /update`, `POST /chat`) as well as the
usual diagnostics routes.