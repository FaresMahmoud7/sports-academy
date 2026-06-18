import type { Metadata } from 'next';
import { Anybody, Hanken_Grotesk, JetBrains_Mono, Cairo } from 'next/font/google';
import { LanguageProvider } from '@/components/LanguageContext';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
});

const anybody = Anybody({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-anybody',
});

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hanken',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains',
});


export const metadata: Metadata = {
  title: 'أكاديمية الأبطال | Champions Academy',
  description: 'نظام إدارة أكاديمية الكاراتيه - لوحة التحكم للمدير الرياضي',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${anybody.variable} ${hanken.variable} ${jetbrains.variable} ${cairo.variable} h-full dark`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="h-full bg-[#0E0E0E] text-[#F2F2F2] antialiased selection:bg-[#FF9500] selection:text-black font-body">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
