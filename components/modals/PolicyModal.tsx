// src/components/modals/PolicyModal.tsx

"use client";

import { X } from "lucide-react";
import React from "react";

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function PolicyModal({
  isOpen,
  onClose,
  title,
  children,
}: PolicyModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors rounded-full p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 overflow-y-auto prose prose-sm max-w-none">
          {children}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 text-right">
          <button
            onClick={onClose}
            className="bg-[#e84741] text-white py-2 px-6 rounded-lg font-semibold hover:bg-[#e84741]/90 transition-colors"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}