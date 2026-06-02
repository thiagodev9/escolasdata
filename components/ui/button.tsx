import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-bold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[48px]',
  {
    variants: {
      variant: {
        default:     'bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft active:scale-[0.98]',
        secondary:   'border-2 border-primary text-primary bg-transparent hover:bg-primary/5 active:scale-[0.98]',
        accent:      'bg-accent text-accent-foreground hover:bg-accent/90 shadow-orange-glow active:scale-[0.98]',
        ghost:       'hover:bg-muted text-slate-600 hover:text-slate-900',
        link:        'text-primary underline-offset-4 hover:underline min-h-0',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]',
        outline:     'border border-border bg-white hover:bg-muted text-slate-700',
        soft:        'bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-[0.98]',
      },
      size: {
        default: 'h-12 px-6 py-2',
        sm:      'h-9 rounded-lg px-4 text-xs min-h-0',
        lg:      'h-14 rounded-2xl px-8 text-base',
        icon:    'h-10 w-10 rounded-xl min-h-0',
        'icon-sm': 'h-8 w-8 rounded-lg min-h-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
