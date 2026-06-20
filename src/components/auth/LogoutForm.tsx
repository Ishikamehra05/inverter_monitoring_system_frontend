"use client"

import { AlertTriangle } from "lucide-react"
import React from "react"

interface LogoutProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  message?: string
}

const LogoutForm: React.FC<LogoutProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message = "Do you want to exit this account?",
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-[420px] p-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-yellow-100 p-2 rounded-full">
            <AlertTriangle className="text-yellow-600" size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            {message}
          </h2>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutForm