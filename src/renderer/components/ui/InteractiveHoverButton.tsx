import React from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '../../lib/utils'

interface InteractiveHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string
  variant?: 'accent' | 'ghost'
}

const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  ({ text = 'Button', className, variant = 'accent', ...props }, ref) => {
    const isAccent = variant === 'accent'
    return (
      <button
        ref={ref}
        className={cn(
          'group relative cursor-pointer overflow-hidden rounded-full border px-5 py-2 text-center text-sm font-semibold transition-all duration-300',
          isAccent
            ? 'border-accent/40 bg-accent/10 text-accent hover:border-accent'
            : 'border-border bg-transparent text-muted-foreground hover:border-border/80 hover:text-foreground',
          className
        )}
        {...props}
      >
        <span className="inline-block transition-all duration-300 group-hover:translate-x-10 group-hover:opacity-0">
          {text}
        </span>
        <div className="absolute inset-0 z-10 flex translate-x-10 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <span>{text}</span>
          <ArrowRight size={14} />
        </div>
        <div className={cn(
          'absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-full transition-all duration-300',
          'group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8]',
          isAccent ? 'bg-accent' : 'bg-muted'
        )} />
      </button>
    )
  }
)

InteractiveHoverButton.displayName = 'InteractiveHoverButton'
export { InteractiveHoverButton }
