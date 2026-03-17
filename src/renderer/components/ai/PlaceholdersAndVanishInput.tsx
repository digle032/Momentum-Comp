import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils'
import { Send } from 'lucide-react'

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
}: {
  placeholders: string[]
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (value: string) => void
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length)
    }, 3000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [placeholders.length])

  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [animating, setAnimating] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!value.trim() || animating) return
    const submitted = value
    setAnimating(true)
    setTimeout(() => {
      setValue('')
      setAnimating(false)
      onSubmit(submitted)
    }, 300)
  }

  return (
    <form
      className={cn(
        'relative w-full max-w-3xl mx-auto bg-muted/70 backdrop-blur-sm h-14 rounded-full overflow-hidden shadow-lg border border-border/60 transition-all duration-300',
        value && 'bg-muted/90'
      )}
      onSubmit={handleSubmit}
    >
      <input
        ref={inputRef}
        value={value}
        type="text"
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value)
            onChange(e)
          }
        }}
        className={cn(
          'w-full relative text-base z-10 border-none bg-transparent text-foreground h-full rounded-full focus:outline-none focus:ring-0 pl-6 pr-20',
          animating && 'text-transparent'
        )}
      />

      <button
        disabled={!value.trim() || animating}
        type="submit"
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 h-9 w-9 rounded-full disabled:bg-muted bg-accent transition-all duration-200 flex items-center justify-center disabled:opacity-50 hover:bg-accent/90"
      >
        <Send className="text-background h-4 w-4" />
      </button>

      <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              key={`placeholder-${currentPlaceholder}`}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'linear' }}
              className="text-sm sm:text-base font-normal text-muted-foreground pl-6 text-left w-[calc(100%-2rem)] truncate"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}
