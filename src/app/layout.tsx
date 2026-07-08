import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "moneylog - Track Money, Manage Life, Build Wealth",
  description: "All-in-one personal finance to track transactions, manage subscriptions, monitor P&L balance, payables & receivables.",
  metadataBase: new URL("https://moneylog.com"),
  icons: {
    icon: "/logo/logo.png",
  },
  openGraph: {
    title: "moneylog - Track Money, Manage Life, Build Wealth",
    description: "All-in-one personal finance to track transactions, manage subscriptions, monitor P&L balance, payables & receivables.",
    url: "https://moneylog.com",
    siteName: "moneylog",
    images: [
      {
        url: "https://moneylog.com/logo/logo.png",
        width: 800,
        height: 800,
        alt: "moneylog Logo",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "moneylog - Track Money, Manage Life, Build Wealth",
    description: "All-in-one personal finance to track transactions, manage subscriptions, monitor P&L balance, payables & receivables.",
    images: ["https://moneylog.com/logo/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
