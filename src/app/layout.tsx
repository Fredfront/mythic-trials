import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { cn } from '@/lib/utils'
import { DM_Sans } from 'next/font/google'
import { ThemeProvider } from './components/theme-provider'

export const metadata: Metadata = {
  title: 'Nerdelandslaget - Mythic Trials',
  description: 'Nerdelandslaget - Mythic Trials ',

  icons: {
    icon: '/MT_logo_white.webp',
  },
}

const DMSans = DM_Sans({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html translate="no">
      <body className={cn(`min-h-screen bg-[#011624] antialiased ${DMSans.className} text-white`)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children} <Analytics /> <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
