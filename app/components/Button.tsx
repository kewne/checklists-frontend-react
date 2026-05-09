import { useState } from 'react';

export type ButtonType = 'primary' | 'secondary' | 'success' | 'danger';
export type ButtonVariant = 'normal' | 'outline' | 'text';
export type ButtonSize = 'medium' | 'large';

export interface ButtonProps {
    type?: ButtonType;
    variant?: ButtonVariant;
    size?: ButtonSize;
    action: () => Promise<void>;
    disabled?: boolean;
    children: React.ReactNode;
}

export function getSizeClasses(size: ButtonSize) {
    switch (size) {
        case 'medium':
            return 'px-2 py-1';
        case 'large':
            return 'px-4 py-2';
    }
}

export function getColorClasses(type: ButtonType, variant: ButtonVariant) {
    switch (variant) {
        case 'normal':
            switch (type) {
                case 'primary':
                    return 'bg-indigo-600 hover:bg-indigo-700 text-white';
                case 'secondary':
                    return 'bg-gray-100 hover:bg-gray-200 text-gray-700';
                case 'success':
                    return 'bg-green-600 hover:bg-green-700 text-white';
                case 'danger':
                    return 'bg-red-600 hover:bg-red-700 text-white';
            }
            break;

        case 'outline':
            switch (type) {
                case 'primary':
                    return 'border border-indigo-300 hover:border-indigo-400 text-indigo-600 hover:bg-indigo-50';
                case 'secondary':
                    return 'border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50';
                case 'success':
                    return 'border border-green-300 hover:border-green-400 text-green-600 hover:bg-green-50';
                case 'danger':
                    return 'border border-red-300 hover:border-red-400 text-red-600 hover:bg-red-50';
            }
            break;

        case 'text':
            switch (type) {
                case 'primary':
                    return 'text-indigo-600 hover:bg-indigo-50';
                case 'secondary':
                    return 'text-gray-700 hover:bg-gray-50';
                case 'success':
                    return 'text-green-600 hover:bg-green-50';
                case 'danger':
                    return 'text-red-600 hover:bg-red-50';
            }
            break;
    }
}

export function Button({
    type = 'primary',
    variant = 'normal',
    size = 'medium',
    action,
    disabled = false,
    children,
}: ButtonProps) {
    const [isWorking, setWorking] = useState(false);

    const sizeClasses = getSizeClasses(size);
    const baseClasses = `${sizeClasses} text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed`;
    const colorClasses = getColorClasses(type, variant);

    const handleAction = async () => {
        setWorking(true);
        try {
            await action();
        } finally {
            setWorking(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleAction}
            disabled={disabled || isWorking}
            className={`${baseClasses} ${colorClasses}`}
        >
            {children}
        </button>
    );
}
