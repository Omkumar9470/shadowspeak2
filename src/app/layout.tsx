import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Make sure this file exists
import AuthProvider from "@/context/AuthProvider";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shadow Speak",
  description: "An anonymous messaging app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
        <body className={`${inter.className} flex flex-col min-h-screen`}>
          <Navbar />
          {children}
        </body>
      </AuthProvider>
    </html>
  );
}