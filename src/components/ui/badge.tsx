
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Update role-specific badge variants with the new colors
        dominant: "border-transparent bg-[#991b1b] text-white hover:bg-[#991b1b]/90",
        submissive: "border-transparent bg-[#475569] text-white hover:bg-[#475569]/90",
        switch: "border-transparent bg-blue-600 text-white hover:bg-blue-500",
        exploring: "border-transparent bg-green-600 text-white hover:bg-green-500",
        // Add new crimson variant for the Hot badge
        crimson: "border-transparent bg-crimson text-white hover:bg-crimson/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
