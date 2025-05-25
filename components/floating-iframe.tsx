// components/floating-iframe.tsx

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface FloatingIframeProps {
  url: string
  buttonLabel?: string
}

export function FloatingIframe({ url, buttonLabel = "Open" }: FloatingIframeProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          className="rounded-full p-4 shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setIsOpen(true)}
        >
          {buttonLabel}
        </Button>
      </div>

      {/* Animated iframe above the button */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 right-6 z-50 w-[90vw] max-w-3xl h-[70vh] bg-white shadow-2xl rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <iframe src={url} className="w-full h-full border-none" />

            <Button
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white z-10"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
