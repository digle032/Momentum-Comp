import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { GlowingCard } from './GlowingCard'

interface ModalProps {
  isOpen: boolean
  onRequestClose: () => void
  title: string
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onRequestClose, title, children }) => {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onRequestClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onRequestClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onRequestClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlowingCard className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-xl text-foreground">{title}</h2>
                <button className="btn-ghost p-1.5 rounded-lg" onClick={onRequestClose}>
                  <X size={16} />
                </button>
              </div>
              {children}
            </GlowingCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
