import type { Metadata } from "next";
import { Toaster } from "sonner";
import { NotificationListener } from "@/components/NotificationListener";
import { FeedbackWidget } from "@/components/features/FeedbackWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: "rateKTH",
  description: "Course reviews for KTH Royal Institute of Technology students",
  openGraph: {
    title: "rateKTH",
    description: "Course reviews for KTH Royal Institute of Technology students",
    url: "https://ratekth.se",
    siteName: "rateKTH",
    images: [
      {
        url: "/ratekth-new-logo.png",
        width: 1200,
        height: 630,
        alt: "rateKTH Logo",
      },
    ],
    locale: "en_SE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "rateKTH",
    description: "Course reviews for KTH Royal Institute of Technology students",
    images: ["/ratekth-new-logo.png"],
  },
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
