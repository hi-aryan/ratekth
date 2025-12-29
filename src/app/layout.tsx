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
        <Toaster 
          duration={5000} 
          position="top-center" 
          expand={false}
          toastOptions={{
            style: {
              borderRadius: '8px',
            },
            classNames: {
              success: '!bg-[#74CA501A] !text-[#74CA50] !border-[#74CA5033]',
              error: '!bg-[#F76C5E1A] !text-[#F76C5E] !border-[#F76C5E33]',
            }
          }}
        />
        <NotificationListener />
        {children}
      </body>
    </html>
  );
}
