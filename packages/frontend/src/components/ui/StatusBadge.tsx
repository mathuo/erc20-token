import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        success: 'bg-green-900/20 text-green-400 border border-green-800/30',
        warning: 'bg-yellow-900/20 text-yellow-400 border border-yellow-800/30',
        error: 'bg-red-900/20 text-red-400 border border-red-800/30',
        info: 'bg-blue-900/20 text-blue-400 border border-blue-800/30',
        neutral: 'bg-gray-800 text-gray-400 border border-gray-700',
        active: 'bg-green-900/20 text-green-400 border border-green-800/30 animate-pulse',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        className={cn(statusBadgeVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

export { StatusBadge, statusBadgeVariants };