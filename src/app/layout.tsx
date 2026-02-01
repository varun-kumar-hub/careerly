import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google"; // 1.3 Typography: Sans-serif (Inter)
import { AuthProvider } from "@/features/auth/AuthProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Careerly | AI-Powered Job Search",
  description: "Track applications, optimize resumes, and find your dream job with Careerly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
