import { useEffect, useRef, useState } from 'react';

export type ButtonType = 'primary' | 'secondary' | 'success' | 'danger';
export type ButtonVariant = 'normal' | 'outline' | 'text';

export interface AdditionalAction {
    title: string;
    action: () => void;
}

export interface ButtonProps {
    type?: ButtonType;
    variant?: ButtonVariant;
    action: () => void;
    additionalActions?: AdditionalAction[];
    disabled?: boolean;
    children: React.ReactNode;
}

function getColorClasses(type: ButtonType, variant: ButtonVariant) {
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
    action,
    additionalActions,
    disabled = false,
    children,
}: ButtonProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const baseClasses = 'px-3 py-2 text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed';
    const colorClasses = getColorClasses(type, variant);

    // Handle click-outside for dropdown
    useEffect(() => {
        if (!isDropdownOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleAdditionalAction = (action: () => void) => {
        setIsDropdownOpen(false);
        action();
    };

    // Split button with dropdown
    if (additionalActions && additionalActions.length > 0) {
        return (
            <div className="relative inline-flex" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={action}
                    disabled={disabled}
                    className={`${baseClasses} ${colorClasses} rounded-r-none`}
                >
                    {children}
                </button>
                <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={disabled}
                    className={`${baseClasses} ${colorClasses} rounded-l-none ${variant === 'outline' ? 'border-l-0' : ''
                        }`}
                    aria-label="Additional actions"
                >
                    &hellip;
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-md shadow-lg min-w-max">
                        {additionalActions.map((item, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleAdditionalAction(item.action)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                            >
                                {item.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Regular button
    return (
        <button
            type="button"
            onClick={action}
            disabled={disabled}
            className={`${baseClasses} ${colorClasses}`}
        >
            {children}
        </button>
    );
}
