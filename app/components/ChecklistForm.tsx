import { useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';
import chevronDownSvg from '/chevron-down.svg?url';
import chevronUpSvg from '/chevron-up.svg?url';
import type { Checklist, ChecklistItem } from '~/lib/api';

interface ChecklistFormProps {
  initialValues?: Checklist;
  submitLabel: string,
  onSubmit?: (data: Checklist) => Promise<void>;
  onCancel?: () => void;
}

interface ChecklistItemComponentProps {
  item: ChecklistItem;
  onUpdate: (id: string, field: keyof ChecklistItem, value: string) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  ref?: React.Ref<HTMLInputElement>;
}

function ChecklistItemComponent({ item, onUpdate, onRemove, onMoveUp, onMoveDown, ref }: ChecklistItemComponentProps) {
  const [showDescription, setShowDescription] = useState(item.description.length > 0);

  const handleRemoveDescription = () => {
    onUpdate(item.id, 'description', '');
    setShowDescription(false);
  };

  return (
    <div className="p-3 border border-gray-200 rounded-md bg-white">
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor={`item-title-${item.id}`}
            className="text-xs font-medium text-gray-600"
          >
            Title
          </label>
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                className="p-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                aria-label={`Move "${item.title || 'item'}" up`}
              >
                <img src={chevronUpSvg} alt="" aria-hidden="true" className="w-4 h-4" />
              </button>
            )}
            {onMoveDown && (
              <button
                type="button"
                onClick={onMoveDown}
                className="p-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                aria-label={`Move "${item.title || 'item'}" down`}
              >
                <img src={chevronDownSvg} alt="" aria-hidden="true" className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemove()}
              className="text-xs text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
            >
              Remove
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={ref}
            id={`item-title-${item.id}`}
            type="text"
            value={item.title}
            onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
            placeholder="Item title"
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 text-sm"
            required
          />
          <button
            type="button"
            onClick={showDescription ? handleRemoveDescription : () => setShowDescription(true)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap"
          >
            <label htmlFor={`item-description-${item.id}`}>
              {showDescription ? 'Description -' : 'Description +'}
            </label>
          </button>
        </div>
      </div>
      {showDescription && (
        <div>
          <div className="flex items-start gap-2 flex-wrap">
            <textarea
              id={`item-description-${item.id}`}
              value={item.description}
              onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
              placeholder="Item description"
              rows={5}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 text-sm resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ChecklistForm({ initialValues, submitLabel, onSubmit, onCancel }: ChecklistFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [items, setItems] = useState<ChecklistItem[]>((initialValues?.items ?? []).map((item) => ({ ...item, id: v4() })));
  const addedItemRef = useRef<HTMLInputElement>(null);
  const lastAddedId = useRef<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit?.({ title, items });
  };

  const addItem = (index: number) => {
    const newId = v4();
    lastAddedId.current = newId;
    setItems((prev) => prev.toSpliced(index, 0, { title: '', description: '', id: newId }));
  };

  const updateItem = (id: string, field: keyof ChecklistItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    setItems((prev) => {
      const newItems = [...prev];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return newItems;
    });
  };

  useEffect(() => {
    if (addedItemRef.current) {
      addedItemRef.current.focus();
      addedItemRef.current = null;
      lastAddedId.current = null;
    }
  }, [items]);

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
        <div className="mb-3">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter checklist title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          <ol className="space-y-3 my-1">
            <button
              type="button"
              onClick={() => addItem(0)}
              className="px-2 w-full rounded-md text-xs text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
            >
              + Add Item
            </button>
            {items.map((item, index) => (
              <li key={item.id}>
                <ChecklistItemComponent
                  item={item}
                  onUpdate={updateItem}
                  onRemove={() => removeItem(item.id)}
                  onMoveUp={index > 0 ? () => moveItem(index, index - 1) : undefined}
                  onMoveDown={index < items.length - 1 ? () => moveItem(index, index + 1) : undefined}
                  ref={item.id === lastAddedId.current ? addedItemRef : undefined}
                />
                <button
                  type="button"
                  onClick={() => addItem(index + 1)}
                  className="px-2 w-full rounded-md text-xs text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
                >
                  + Add Item
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-md font-medium text-gray-700 border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex-[2] bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </>
  );
}
