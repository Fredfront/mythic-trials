import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from './components/theme-provider'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Nerdelandslaget - Mythic Trials',
  description: 'Nerdelandslaget - Mythic Trials ',
  icons: {
    icon: '/NL_logo_stor_liten.webp',
  },
}

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn('min-h-screen bg-black font-sans antialiased', fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children} <Analytics /> <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
