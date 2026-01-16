import type { Metadata } from "next";
import Header from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "MusicWork - 音楽仕事マッチングプラットフォーム",
  description: "音楽家と依頼者をつなぐマッチングサービス",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className="min-h-screen bg-gray-50"
        suppressHydrationWarning
      >
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
