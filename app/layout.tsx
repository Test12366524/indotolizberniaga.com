import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/providers/redux";
import ClientAuthGuard from "@/components/client-guards";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Koperasi Merah Putih",
  description: "Mewujudkan kemandirian dan kesejahteraan anggota melalui unit usaha simpan pinjam dan marketplace yang terintegrasi.",
  icons: {
    icon: "/logo-koperasi-merah-putih-online.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <ClientAuthGuard
            excludedRoutes={["/auth", "/auth/login", "/public", "/"]}
            excludedFetchPrefixes={["/api/auth/", "/auth/"]}
            loginPath="/auth/login"
          />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
