"use client"

import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

interface WalletConnectionProps {
  onConnect: () => void
}

export function WalletConnection({ onConnect }: WalletConnectionProps) {
  return (
    <Button onClick={onConnect} className="w-full flex items-center gap-2">
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </Button>
  )
}
