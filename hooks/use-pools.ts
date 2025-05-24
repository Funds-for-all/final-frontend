"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { FACTORY_CONTRACT_ADDRESS, FACTORY_ABI, POOL_ABI } from "@/lib/contracts"

export function usePools() {
  const [pools, setPools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadPools = async () => {
    try {
      if (!window.ethereum) {
        setPools([])
        return
      }

      // Create provider with explicit network configuration to avoid ENS issues
      const provider = new ethers.BrowserProvider(window.ethereum, "any")

      // Check if factory contract address is set and valid
      if (
        !FACTORY_CONTRACT_ADDRESS ||
        FACTORY_CONTRACT_ADDRESS === "0x..." ||
        !ethers.isAddress(FACTORY_CONTRACT_ADDRESS)
      ) {
        console.warn("Factory contract address not set or invalid")
        setPools([])
        return
      }

      // Check if the factory contract exists
      const factoryCode = await provider.getCode(FACTORY_CONTRACT_ADDRESS)
      if (factoryCode === "0x") {
        console.error("No contract found at factory address:", FACTORY_CONTRACT_ADDRESS)
        setPools([])
        return
      }

      const factory = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_ABI, provider)

      let poolAddresses: string[] = []
      try {
        poolAddresses = await factory.getAllPools()
      } catch (error) {
        console.error("Error getting pools from factory:", error)
        setPools([])
        return
      }

      if (poolAddresses.length === 0) {
        setPools([])
        return
      }

      const poolsData = await Promise.allSettled(
        poolAddresses.map(async (address: string) => {
          try {
            // Validate address
            if (!ethers.isAddress(address)) {
              throw new Error(`Invalid address: ${address}`)
            }

            // Check if contract exists
            const code = await provider.getCode(address)
            if (code === "0x") {
              throw new Error(`No contract at address: ${address}`)
            }

            const poolContract = new ethers.Contract(address, POOL_ABI, provider)

            const [name, creator, goalAmount, deadline, balance, isEnded, goalReached] = await Promise.all([
              poolContract.name(),
              poolContract.creator(),
              poolContract.goalAmount(),
              poolContract.deadline(),
              poolContract.getBalance(),
              poolContract.isEnded(),
              poolContract.goalReached(),
            ])

            return {
              address,
              name,
              creator,
              goalAmount: goalAmount.toString(),
              deadline: Number(deadline),
              balance: balance.toString(),
              isEnded,
              goalReached,
            }
          } catch (error) {
            console.error(`Error loading pool ${address}:`, error)
            throw error
          }
        }),
      )

      // Filter out failed pool loads and extract successful ones
      const validPools = poolsData
        .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
        .map((result) => result.value)

      setPools(validPools.reverse()) // Show newest first
    } catch (error) {
      console.error("Error loading pools:", error)
      setPools([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPools()
  }, [])

  return {
    pools,
    loading,
    refreshPools: loadPools,
  }
}
