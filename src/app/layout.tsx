import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "rateKTH",
  description: "Course reviews for KTH students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
