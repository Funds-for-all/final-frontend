// components/iframe-popup-button.tsx

"use client"

import { useState } from "react"
import { X, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function IframePopupButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        aria-label="Open Info"
      >
        <Info className="w-6 h-6" />
      </button>

      {/* Iframe Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="iframe"
            className="fixed inset-0 bg-white z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-50 bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Iframe Content */}
            <iframe
              src="https://funds-for-all.github.io/landing-page/"
              className="w-full h-full border-none"
              title="Landing Page"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
