import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Photo Booth",
    short_name: "Photo Booth",
    description: "Snap a four-photo strip with your front camera.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFF9F7",
    theme_color: "#F6DCEB",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
