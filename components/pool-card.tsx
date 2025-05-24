"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Clock, Target, User } from "lucide-react"
import { ethers } from "ethers"
import Link from "next/link"

interface Pool {
  address: string
  name: string
  creator: string
  goalAmount: string
  deadline: number
  balance: string
  isEnded: boolean
  goalReached: boolean
}

interface PoolCardProps {
  pool: Pool
}

export function PoolCard({ pool }: PoolCardProps) {
  // Validate pool data
  if (!pool || !pool.address || !ethers.isAddress(pool.address)) {
    return null
  }

  let goalAmountEth: string
  let balanceEth: string
  let progress: number

  try {
    goalAmountEth = ethers.formatEther(pool.goalAmount || "0")
    balanceEth = ethers.formatEther(pool.balance || "0")
    progress = (Number.parseFloat(balanceEth) / Number.parseFloat(goalAmountEth)) * 100
  } catch (error) {
    console.error("Error formatting pool amounts:", error)
    goalAmountEth = "0"
    balanceEth = "0"
    progress = 0
  }

  const timeLeft = (pool.deadline || 0) * 1000 - Date.now()
  const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)))

  const getStatusBadge = () => {
    if (pool.isEnded) {
      return pool.goalReached ? (
        <Badge className="bg-green-100 text-green-800">Successful</Badge>
      ) : (
        <Badge variant="destructive">Failed</Badge>
      )
    }
    return timeLeft > 0 ? (
      <Badge className="bg-blue-100 text-blue-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Ended</Badge>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{pool.name || "Unnamed Pool"}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <User className="w-3 h-3" />
              {pool.creator ? `${pool.creator.slice(0, 6)}...${pool.creator.slice(-4)}` : "Unknown"}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>
              {balanceEth} / {goalAmountEth} ETH
            </span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-500" />
            <span>{goalAmountEth} ETH</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{pool.isEnded ? "Ended" : `${daysLeft}d left`}</span>
          </div>
        </div>

        <Link href={`/pool/${pool.address}`}>
          <Button className="w-full">View Details</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
