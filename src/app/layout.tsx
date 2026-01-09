import type { Metadata } from "next";
import { Toaster } from "sonner";
import { NotificationListener } from "@/components/NotificationListener";
import { FeedbackWidget } from "@/components/features/FeedbackWidget";
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
        <Toaster 
          duration={5000} 
          position="top-center" 
          expand={false}
          toastOptions={{
            style: {
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(0,0,0,0.10)',
            },
            classNames: {
              success: '!bg-[#68BF431A] !text-[#68BF43] !border-[#68BF4333]',
              error: '!bg-[#F76C5E1A] !text-[#F76C5E] !border-[#F76C5E33]',
            }
          }}
        />
        <NotificationListener />
        {children}
        <FeedbackWidget />
      </body>
    </html>
  );
}
