"use client"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false)
  
  // WhatsApp business number for Mitss
  const whatsappNumber = "919950036077" // Format: country code + number (no + or spaces)
  const message = encodeURIComponent("Hi! I'm interested in your furniture products. Can you help me?")
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 border border-border animate-in slide-in-from-bottom-5">
          <div className="bg-[#25D366] text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-[#25D366]" />
              </div>
              <div>
                <h3 className="font-semibold">MITSS Furniture</h3>
                <p className="text-xs opacity-90">Typically replies instantly</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                👋 Hi there! Welcome to MITSS Furniture.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                How can we help you today?
              </p>
            </div>
            <p className="text-xs text-gray-500 text-center mb-3">
              Chat with us on WhatsApp
            </p>
          </div>

          <div className="p-4 border-t border-border">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white">
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Chat on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </>
  )
}
