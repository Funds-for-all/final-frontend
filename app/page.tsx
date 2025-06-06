"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Plus, Clock, Target, Users } from "lucide-react"
import { WalletConnection } from "@/components/wallet-connection"
import { CreatePoolDialog } from "@/components/create-pool-dialog"
import { PoolCard } from "@/components/pool-card"
import { useWallet } from "@/hooks/use-wallet"
import { usePools } from "@/hooks/use-pools"
import { FACTORY_CONTRACT_ADDRESS } from "@/lib/contracts"
import { FloatingIframe } from "@/components/floating-iframe"
import { IframeOnDisconnect } from "@/components/iframe-on-disconnect"
import { IframePopupButton } from "@/components/iframe-popup-button"
import { ethers } from "ethers"

export default function HomePage() {
  const { account, connectWallet, isConnected, chainId } = useWallet()
  const { pools, loading, refreshPools } = usePools()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Check if contract address is configured and valid
  const isContractConfigured =
    typeof FACTORY_CONTRACT_ADDRESS === "string" &&
    FACTORY_CONTRACT_ADDRESS !== ("0x7aA03fd7Eb166417A4f31B103843036a3a805713" as string) &&
    ethers.isAddress(FACTORY_CONTRACT_ADDRESS)

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <IframePopupButton />
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Funds-for-all</CardTitle>
            <CardDescription>Connect your wallet to create and participate in fund pools</CardDescription>
            {/* <IframePopupButton /> */}
            {/* <IframeOnDisconnect /> */}
          </CardHeader>
          <CardContent>
            <WalletConnection onConnect={connectWallet} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Funds-for-all</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
                </span>
                {chainId && <span>Chain ID: {Number.parseInt(chainId, 16)}</span>}
              </div>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
              disabled={!isContractConfigured}
            >
              <Plus className="w-4 h-4" />
              Create Pool
            </Button>
          </div>

          {!isContractConfigured && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Contract address not configured or invalid. Please update FACTORY_CONTRACT_ADDRESS in lib/contracts.ts
                with a valid contract address.
              </p>
              {FACTORY_CONTRACT_ADDRESS && FACTORY_CONTRACT_ADDRESS !== ("0x7aA03fd7Eb166417A4f31B103843036a3a805713" as string) && (
                <p className="text-xs text-yellow-700 mt-1">Current address: {FACTORY_CONTRACT_ADDRESS}</p>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Pools</p>
                    <p className="text-2xl font-bold text-gray-900">{pools.length}</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Pools</p>
                    <p className="text-2xl font-bold text-gray-900">{pools.filter((pool) => !pool.isEnded).length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Successful Pools</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {pools.filter((pool) => pool.isEnded && pool.goalReached).length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">All Pools</h2>
            <Button variant="outline" onClick={refreshPools} disabled={loading || !isContractConfigured}>
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        {!isContractConfigured ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Contract Not Configured</h3>
              <p className="text-gray-600 mb-4">
                Please deploy your smart contracts and update the contract addresses in lib/contracts.ts
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Steps to configure:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Deploy the FundPoolFactory contract</li>
                  <li>Copy the deployed contract address</li>
                  <li>Update FACTORY_CONTRACT_ADDRESS in lib/contracts.ts</li>
                  <li>Refresh the page</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pools.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pools found</h3>
              <p className="text-gray-600 mb-4">
                {isContractConfigured
                  ? "Be the first to create a fund pool!"
                  : "Configure your contract address first, then create a pool."}
              </p>
              <Button onClick={() => setShowCreateDialog(true)} disabled={!isContractConfigured}>
                Create First Pool
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => (
              <PoolCard key={pool.address} pool={pool} />
            ))}
          </div>
        )}
      </main>

      <CreatePoolDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={refreshPools} />
      <FloatingIframe url="https://real-time-chat-weld.vercel.app/" buttonLabel="Public-Chat" />
    </div>
  )
}
