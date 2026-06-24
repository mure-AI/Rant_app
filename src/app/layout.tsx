import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rant",
  description: "Turn emotional overload into structured clarity and next steps."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
