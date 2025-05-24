"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Clock, Target, Vote, Wallet } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/hooks/use-wallet"
import { POOL_ABI } from "@/lib/contracts"

export default function PoolDetailPage() {
  const params = useParams()
  const poolAddress = params.address as string
  const { account, isConnected } = useWallet()
  const { toast } = useToast()

  const [pool, setPool] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [fundAmount, setFundAmount] = useState("")
  const [candidateAddress, setCandidateAddress] = useState("")
  const [candidates, setCandidates] = useState<string[]>([])
  const [myContribution, setMyContribution] = useState("0")
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    if (poolAddress && isConnected) {
      loadPoolData()
    }
  }, [poolAddress, isConnected])

  const loadPoolData = async () => {
    try {
      if (!window.ethereum) {
        setPool(null)
        return
      }

      // Validate the pool address format
      if (!poolAddress || !ethers.isAddress(poolAddress)) {
        console.error("Invalid pool address:", poolAddress)
        setPool(null)
        return
      }

      // Use "any" network to avoid ENS issues
      const provider = new ethers.BrowserProvider(window.ethereum, "any")

      // Check if the address has code (is a contract)
      const code = await provider.getCode(poolAddress)
      if (code === "0x") {
        console.error("No contract found at address:", poolAddress)
        setPool(null)
        return
      }

      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider)

      // Test if this is actually a pool contract by calling a simple view function
      try {
        await poolContract.name()
      } catch (error) {
        console.error("Address is not a valid pool contract:", poolAddress)
        setPool(null)
        return
      }

      const [name, creator, goalAmount, deadline, balance, isEnded, goalReached, candidatesList, myContrib] =
        await Promise.all([
          poolContract.name().catch(() => "Unknown Pool"),
          poolContract.creator().catch(() => "0x0000000000000000000000000000000000000000"),
          poolContract.goalAmount().catch(() => "0"),
          poolContract.deadline().catch(() => "0"),
          poolContract.getBalance().catch(() => "0"),
          poolContract.isEnded().catch(() => false),
          poolContract.goalReached().catch(() => false),
          poolContract.getCandidates().catch(() => []),
          account ? poolContract.getMyContribution(account).catch(() => "0") : "0",
        ])

      setPool({
        address: poolAddress,
        name,
        creator,
        goalAmount: goalAmount.toString(),
        deadline: Number(deadline),
        balance: balance.toString(),
        isEnded,
        goalReached,
      })

      setCandidates(candidatesList)
      setMyContribution(myContrib.toString())

      if (account && isEnded && goalReached) {
        try {
          const voted = await poolContract.hasVoted(account)
          setHasVoted(voted)
        } catch (error) {
          console.error("Error checking vote status:", error)
          setHasVoted(false)
        }
      }
    } catch (error) {
      console.error("Error loading pool data:", error)
      setPool(null)
    } finally {
      setLoading(false)
    }
  }

  const handleFund = async () => {
    if (!fundAmount || !window.ethereum) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum, "any")
      const signer = await provider.getSigner()

      const tx = await signer.sendTransaction({
        to: poolAddress,
        value: ethers.parseEther(fundAmount),
      })

      await tx.wait()

      toast({
        title: "Success!",
        description: "Your contribution has been sent.",
      })

      setFundAmount("")
      loadPoolData()
    } catch (error: any) {
      console.error("Error funding pool:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fund pool",
        variant: "destructive",
      })
    }
  }

  const handleAddCandidate = async () => {
    if (!candidateAddress || !window.ethereum) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum, "any")
      const signer = await provider.getSigner()
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, signer)

      const tx = await poolContract.addCandidate(candidateAddress)
      await tx.wait()

      toast({
        title: "Success!",
        description: "Candidate added successfully.",
      })

      setCandidateAddress("")
      loadPoolData()
    } catch (error: any) {
      console.error("Error adding candidate:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add candidate",
        variant: "destructive",
      })
    }
  }

  const handleVote = async (candidate: string) => {
    if (!window.ethereum) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum, "any")
      const signer = await provider.getSigner()
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, signer)

      const tx = await poolContract.vote(candidate)
      await tx.wait()

      toast({
        title: "Success!",
        description: "Your vote has been cast.",
      })

      loadPoolData()
    } catch (error: any) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to vote",
        variant: "destructive",
      })
    }
  }

  const handleClosePool = async () => {
    if (!window.ethereum) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum, "any")
      const signer = await provider.getSigner()
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, signer)

      const tx = await poolContract.closePool()
      await tx.wait()

      toast({
        title: "Success!",
        description: "Pool has been closed.",
      })

      loadPoolData()
    } catch (error: any) {
      console.error("Error closing pool:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to close pool",
        variant: "destructive",
      })
    }
  }

  const handleWithdrawToWinner = async () => {
    if (!window.ethereum) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum, "any")
      const signer = await provider.getSigner()
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, signer)

      const tx = await poolContract.withdrawToWinner()
      await tx.wait()

      toast({
        title: "Success!",
        description: "Funds have been withdrawn to the winner.",
      })

      loadPoolData()
    } catch (error: any) {
      console.error("Error withdrawing to winner:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw to winner",
        variant: "destructive",
      })
    }
  }

  const handleClaimRefund = async () => {
    if (!window.ethereum) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum, "any")
      const signer = await provider.getSigner()
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, signer)

      const tx = await poolContract.claimRefund()
      await tx.wait()

      toast({
        title: "Success!",
        description: "Your refund has been processed.",
      })

      loadPoolData()
    } catch (error: any) {
      console.error("Error claiming refund:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to claim refund",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pools
            </Button>
          </Link>
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pools
            </Button>
          </Link>
          <Card className="text-center">
            <CardContent className="p-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Pool not found</h1>
              <p className="text-gray-600 mb-4">
                The pool at address {poolAddress} could not be found or is not a valid pool contract.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Please check:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>The address is correct</li>
                  <li>The contract is deployed on this network</li>
                  <li>You're connected to the right network</li>
                </ul>
              </div>
              <Link href="/">
                <Button className="mt-4">Go Back to Pools</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const goalAmountEth = ethers.formatEther(pool.goalAmount)
  const balanceEth = ethers.formatEther(pool.balance)
  const myContribEth = ethers.formatEther(myContribution)
  const progress = (Number.parseFloat(balanceEth) / Number.parseFloat(goalAmountEth)) * 100

  const timeLeft = pool.deadline * 1000 - Date.now()
  const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)))
  const isCreator = account?.toLowerCase() === pool.creator.toLowerCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pools
            </Button>
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pool.name}</h1>
              <p className="text-gray-600 mt-1">
                Created by {pool.creator.slice(0, 6)}...{pool.creator.slice(-4)}
              </p>
            </div>
            <div className="flex gap-2">
              {pool.isEnded ? (
                pool.goalReached ? (
                  <Badge className="bg-green-100 text-green-800">Successful</Badge>
                ) : (
                  <Badge variant="destructive">Failed</Badge>
                )
              ) : timeLeft > 0 ? (
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              ) : (
                <Badge variant="secondary">Ended</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Goal Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{goalAmountEth} ETH</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Raised</p>
                  <p className="text-2xl font-bold text-gray-900">{balanceEth} ETH</p>
                </div>
                <Wallet className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Time Left</p>
                  <p className="text-2xl font-bold text-gray-900">{pool.isEnded ? "Ended" : `${daysLeft}d`}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Raised: {balanceEth} ETH</span>
                <span>{progress.toFixed(1)}% of goal</span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="fund" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="fund">Fund</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="vote">Vote</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="fund">
            <Card>
              <CardHeader>
                <CardTitle>Fund This Pool</CardTitle>
                <CardDescription>
                  Contribute ETH to help reach the goal. Your contribution: {myContribEth} ETH
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!pool.isEnded && timeLeft > 0 ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (ETH)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.0"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleFund} className="w-full" disabled={!fundAmount}>
                      Fund Pool
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Funding period has ended</p>
                    {pool.isEnded && !pool.goalReached && Number.parseFloat(myContribEth) > 0 && (
                      <Button onClick={handleClaimRefund} className="mt-4">
                        Claim Refund
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <CardTitle>Candidates</CardTitle>
                <CardDescription>
                  {isCreator
                    ? "Add candidates who can receive the funds if the goal is reached."
                    : "View candidates who can receive the funds."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isCreator && !pool.isEnded && (
                  <div className="space-y-2">
                    <Label htmlFor="candidate">Candidate Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="candidate"
                        placeholder="0x..."
                        value={candidateAddress}
                        onChange={(e) => setCandidateAddress(e.target.value)}
                      />
                      <Button onClick={handleAddCandidate} disabled={!candidateAddress}>
                        Add
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {candidates.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">No candidates added yet</p>
                  ) : (
                    candidates.map((candidate, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <span className="font-mono text-sm">{candidate}</span>
                        <Badge variant="outline">Candidate {index + 1}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vote">
            <Card>
              <CardHeader>
                <CardTitle>Vote for Winner</CardTitle>
                <CardDescription>
                  {pool.isEnded && pool.goalReached
                    ? "Vote for which candidate should receive the funds."
                    : "Voting is only available after the pool ends successfully."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pool.isEnded && pool.goalReached ? (
                  Number.parseFloat(myContribEth) > 0 ? (
                    hasVoted ? (
                      <div className="text-center py-8">
                        <Vote className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <p className="text-green-600 font-medium">You have already voted!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {candidates.map((candidate, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => handleVote(candidate)}
                          >
                            <Vote className="w-4 h-4 mr-2" />
                            Vote for {candidate.slice(0, 6)}...{candidate.slice(-4)}
                          </Button>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Only contributors can vote</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      {pool.isEnded
                        ? "Goal was not reached - no voting needed"
                        : "Voting will be available after the pool ends successfully"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
                <CardDescription>Administrative functions for pool management.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!pool.isEnded && timeLeft <= 0 && (
                  <Button onClick={handleClosePool} className="w-full">
                    Close Pool
                  </Button>
                )}

                {pool.isEnded && pool.goalReached && (
                  <Button onClick={handleWithdrawToWinner} className="w-full">
                    Withdraw to Winner
                  </Button>
                )}

                <div className="text-sm text-gray-600 space-y-1">
                  <p>Pool Address: {pool.address}</p>
                  <p>Creator: {pool.creator}</p>
                  <p>Deadline: {new Date(pool.deadline * 1000).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
