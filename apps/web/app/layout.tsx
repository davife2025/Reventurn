import type { Metadata } from "next";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";
import { ChatWidget } from "./components/ChatWidget";

export const metadata: Metadata = {
  title: "Reventurn",
  description: "See — and act on — where money earns the most in the world."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-graphite-900 font-sans text-graphite-50 antialiased">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
