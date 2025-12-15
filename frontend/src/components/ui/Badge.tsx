import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                {
                    'border-transparent bg-blue-600 text-white hover:bg-blue-700': variant === 'default',
                    'border-transparent bg-gray-700 text-gray-100 hover:bg-gray-600': variant === 'secondary',
                    'border-transparent bg-red-600 text-white hover:bg-red-700': variant === 'destructive',
                    'text-white border-white/20': variant === 'outline',
                    'border-transparent bg-green-600 text-white hover:bg-green-700': variant === 'success',
                    'border-transparent bg-yellow-600 text-white hover:bg-yellow-700': variant === 'warning',
                },
                className
            )}
            {...props}
        />
    );
}
