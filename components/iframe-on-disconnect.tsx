// components/iframe-on-disconnect.tsx

"use client"

import { useWallet } from "@/hooks/use-wallet"

export function IframeOnDisconnect() {
  const { isConnected } = useWallet()

  if (isConnected) return null

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <iframe
        src="https://funds-for-all.github.io/landing-page/"
        className="w-full h-full border-none"
        title="Landing Page"
      />
    </div>
  )
}
