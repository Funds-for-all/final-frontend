"use client"

import type React from "react"

declare global {
  interface Window {
    ethereum?: any
  }
}

import { useState } from "react"
import { ethers } from "ethers"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { FACTORY_CONTRACT_ADDRESS, FACTORY_ABI } from "@/lib/contracts"

interface CreatePoolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreatePoolDialog({ open, onOpenChange, onSuccess }: CreatePoolDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    goalAmount: "",
    durationInDays: "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not found")
      }

      // Check if factory contract address is set
      if (!FACTORY_CONTRACT_ADDRESS || FACTORY_CONTRACT_ADDRESS.toLowerCase() === "0x7aA03fd7Eb166417A4f31B103843036a3a805713") {
        throw new Error("Factory contract address not configured. Please update lib/contracts.ts")
      }

      const provider = new ethers.BrowserProvider(window.ethereum, "any")
      const signer = await provider.getSigner()
      const factory = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_ABI, signer)

      const goalAmountWei = ethers.parseEther(formData.goalAmount)
      const durationInDays = Number.parseInt(formData.durationInDays)

      const tx = await factory.createFundPool(formData.name, goalAmountWei, durationInDays)

      await tx.wait()

      toast({
        title: "Pool Created!",
        description: "Your fund pool has been created successfully.",
      })

      setFormData({ name: "", goalAmount: "", durationInDays: "" })
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error("Error creating pool:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create pool",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Fund Pool</DialogTitle>
          <DialogDescription>Create a new fund pool for your project or cause.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Pool Name</Label>
            <Input
              id="name"
              placeholder="Enter pool name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goalAmount">Goal Amount (ETH)</Label>
            <Input
              id="goalAmount"
              type="number"
              step="0.01"
              placeholder="0.0"
              value={formData.goalAmount}
              onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (Days)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="30"
              value={formData.durationInDays}
              onChange={(e) => setFormData({ ...formData, durationInDays: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Pool"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
