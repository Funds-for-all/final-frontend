import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Funds-for-all',
  description: 'This project is a decentralized application (dApp) that allows users to create and participate in fund pools and DAO voting using Ethereum smart contracts.',
  icons: {
    icon: "https://avatars.githubusercontent.com/u/213049368?s=200&v=4",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
