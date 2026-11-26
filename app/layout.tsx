import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { Toaster } from "sonner";
import { FcmListener } from "@/components/fcm-listener";
import SeoScript from "@/components/storefront/SeoScript";
import { SeoService } from "@/services/seo.service";

export async function generateMetadata(): Promise<Metadata> {
  const iconConfig = {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/logo-clean.png', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  };

  try {
    const seo = await SeoService.getByPageName("GLOBAL");
    if (seo && seo.isActive !== false) {
      return {
        title: seo.metaTitle || 'zelvira | Premium Aesthetic Store',
        description: seo.metaDescription || 'Your one-stop destination for curated fashion, beauty, and lifestyle products.',
        keywords: seo.metaKeywords ? seo.metaKeywords.split(',').map((k) => k.trim()) : undefined,
        icons: iconConfig,
      };
    }
  } catch {
    // Fallback to default metadata
  }

  return {
    title: 'zelvira | Premium Aesthetic Store',
    description: 'Your one-stop destination for curated fashion, beauty, and lifestyle products. Experience the premium of zelvira.',
    icons: iconConfig,
  };
}

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`h-full antialiased ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://s3.zelvira.co.id" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://s3.zelvira.co.id" />
        <link rel="preconnect" href="https://api.zelvira.co.id" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.zelvira.co.id" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        {/* Global SEO / Head Tracking Scripts */}
        <SeoScript pageName="GLOBAL" placement="HEAD" />
      </head>
      <body className={`min-h-full flex flex-col bg-background text-foreground font-sans ${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
          <CartProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </CartProvider>
          <FcmListener />
          <Toaster />
          {/* Global Body Tracking Scripts (e.g. Chat Widget, NoScript) */}
          <SeoScript pageName="GLOBAL" placement="BODY" />
        </ThemeProvider>
      </body>
    </html>
  );
}
