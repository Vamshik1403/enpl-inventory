import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onFocus, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    
    React.useImperativeHandle(ref, () => inputRef.current!)
    
    React.useEffect(() => {
      const el = inputRef.current
      if (el && el.value) {
        // Use setTimeout to ensure this runs after any programmatic focus
        const timer = setTimeout(() => {
          try {
            const len = el.value.length
            if (len > 0 && el.selectionStart === 0 && el.selectionEnd === len) {
              el.setSelectionRange(len, len)
            }
          } catch {}
        }, 0)
        return () => clearTimeout(timer)
      }
    }, [props.value])
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        onFocus={(e) => {
          try {
            const el = e.currentTarget
            const len = el.value?.length ?? 0
            if (len > 0 && el.selectionStart === 0 && el.selectionEnd === len) {
              el.setSelectionRange(len, len)
            }
          } catch {}
          onFocus?.(e)
        }}
        ref={inputRef}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
