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

The WebSocket server lives in [`server/server.js`](server/server.js) with full
setup details in [`server/README.md`](server/README.md). To run it locally while
developing the client, launch it in a separate terminal:

```bash
npm start
```

The server listens on port `8080` by default and exposes HTTP diagnostics as
well as the WebSocket endpoint consumed by the client.
