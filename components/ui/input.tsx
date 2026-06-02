import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2',
        'text-base text-slate-800 placeholder:text-slate-400 font-medium',
        'focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
