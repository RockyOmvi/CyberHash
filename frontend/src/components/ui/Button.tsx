import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
                    {
                        'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20': variant === 'default',
                        'border border-white/20 bg-transparent hover:bg-white/10 text-white': variant === 'outline',
                        'hover:bg-white/10 text-gray-300 hover:text-white': variant === 'ghost',
                        'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20': variant === 'destructive',
                        'h-9 px-4 py-2': size === 'default',
                        'h-8 rounded-md px-3 text-xs': size === 'sm',
                        'h-10 rounded-md px-8': size === 'lg',
                        'h-9 w-9': size === 'icon',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";
