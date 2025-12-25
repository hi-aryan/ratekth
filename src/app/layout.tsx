import type { Metadata } from "next";
import { Toaster } from "sonner";
import { NotificationListener } from "@/components/NotificationListener";
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
      <body className="antialiased font-sans">
        <Toaster position="top-center" expand={false} richColors />
        <NotificationListener />
        {children}
      </body>
    </html>
  );
}
