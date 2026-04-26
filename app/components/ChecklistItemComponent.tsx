interface ChecklistItemRowProps {
    item: {
        title: string;
        description: string;
    };
    index: number;
    isDescriptionVisible: boolean;
    onUpdateItem: (index: number, field: 'title' | 'description', value: string) => void;
    onRemoveItem: (index: number) => void;
    onToggleDescription: (index: number) => void;
}

export function ChecklistItemRow({
    item,
    index,
    isDescriptionVisible,
    onUpdateItem,
    onRemoveItem,
    onToggleDescription,
}: ChecklistItemRowProps) {
    return (
        <div className="p-3 border border-gray-200 rounded-md bg-white">
            <div className="flex items-start gap-2 mb-2">
                <div className="flex-1">
                    <label
                        htmlFor={`item-title-${index}`}
                        className="block text-xs font-medium text-gray-600 mb-1"
                    >
                        Title
                    </label>
                    <input
                        id={`item-title-${index}`}
                        type="text"
                        value={item.title}
                        onChange={(e) => onUpdateItem(index, 'title', e.target.value)}
                        placeholder="Item title"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 text-sm"
                        required
                    />
                </div>
                <button
                    type="button"
                    onClick={() => onRemoveItem(index)}
                    aria-label={`Remove item ${index + 1}`}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors mt-5"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                </button>
            </div>
            <div className="flex items-start gap-2 mb-2">
                <button
                    type="button"
                    onClick={() => onToggleDescription(index)}
                    className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors mt-5"
                >
                    {isDescriptionVisible ? 'Hide' : 'Add'} description
                </button>
                <div className="flex-1" />
            </div>
            {isDescriptionVisible && (
                <div className="overflow-hidden transition-all duration-300 ease-in-out">
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label
                            htmlFor={`item-description-${index}`}
                            className="block text-xs font-medium text-gray-600 mb-1"
                        >
                            Description
                        </label>
                        <textarea
                            id={`item-description-${index}`}
                            value={item.description}
                            onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                            placeholder="Item description"
                            rows={2}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 text-sm resize-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
