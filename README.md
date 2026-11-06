# Photo Booth

A phone-first photo booth web app built with Next.js. It uses the front camera, counts down 3-2-1, takes four photos and combines them into a vertical photo strip you can save to Photos (or download on a laptop). It can be added to the iPhone home screen and opens full screen.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Test on an iPhone

Browsers only allow the camera over HTTPS (or on localhost), so start the dev server with HTTPS and open it from a phone on the same Wi-Fi:

```bash
npx next dev --experimental-https -H 0.0.0.0
```

Then visit `https://<your-computer's-ip>:3000` and accept the certificate warning. A tunnel such as ngrok also works.
