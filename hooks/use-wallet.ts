"use client"

import { useState, useEffect } from "react"

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState<string | null>(null)

  useEffect(() => {
    checkConnection()

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" })

        setChainId(currentChainId)

        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Error checking connection:", error)
      }
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is required to use this application")
      return
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      const currentChainId = await window.ethereum.request({ method: "eth_chainId" })

      setAccount(accounts[0])
      setChainId(currentChainId)
      setIsConnected(true)
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null)
      setIsConnected(false)
    } else {
      setAccount(accounts[0])
      setIsConnected(true)
    }
  }

  const handleChainChanged = (newChainId: string) => {
    setChainId(newChainId)
    // Reload the page to reset the app state
    window.location.reload()
  }

  return {
    account,
    isConnected,
    chainId,
    connectWallet,
  }
}
