import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "./lib/fonts";

export const metadata: Metadata = {
  title: "Photo Booth",
  description: "Snap a four-photo strip with your front camera.",
  applicationName: "Photo Booth",
  appleWebApp: {
    capable: true,
    title: "Photo Booth",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  // Older iOS versions only look for the apple-prefixed tag.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F6DCEB",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
