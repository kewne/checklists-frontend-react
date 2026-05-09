import { useEffect, useRef, useState } from 'react';
import type { ButtonType, ButtonVariant, ButtonSize } from './Button';
import { getSizeClasses, getColorClasses } from './Button';

export interface MenuItem {
    title: string;
    action: () => void;
}

export interface MenuButtonProps {
    type?: ButtonType;
    variant?: ButtonVariant;
    size?: ButtonSize;
    items: MenuItem[];
    disabled?: boolean;
    children: React.ReactNode;
    ariaLabel?: string;
}

export function MenuButton({
    type = 'primary',
    variant = 'normal',
    size = 'medium',
    items,
    disabled = false,
    children,
    ariaLabel,
}: MenuButtonProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const sizeClasses = getSizeClasses(size);
    const baseClasses = `${sizeClasses} text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed`;
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

    const handleMenuItemClick = (action: () => void) => {
        setIsDropdownOpen(false);
        action();
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={disabled}
                className={`${baseClasses} ${colorClasses}`}
                aria-label={ariaLabel || 'Menu'}
            >
                {children}
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-md shadow-lg min-w-max">
                    {items.map((item, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleMenuItemClick(item.action)}
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
