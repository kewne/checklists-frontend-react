import { useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import { Button } from "~/components/Button";
import { TextInput } from "~/components/TextInput";
import type { Checklist, ChecklistItem } from "~/lib/api";
import chevronDownSvg from "/chevron-down.svg?url";
import chevronUpSvg from "/chevron-up.svg?url";

interface ChecklistFormProps {
  initialValues?: Checklist;
  submitLabel: string;
  onSubmit?: (data: Checklist) => Promise<void>;
  onCancel?: () => Promise<void>;
}

interface ChecklistItemComponentProps {
  item: ChecklistItem;
  onUpdate: (id: string, field: keyof ChecklistItem, value: string) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  ref?: React.Ref<HTMLInputElement>;
}

function ChecklistItemComponent({
  item,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  ref,
}: ChecklistItemComponentProps) {
  const [showDescription, setShowDescription] = useState(
    item.description.length > 0,
  );
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (showDescription) {
      descriptionRef.current?.focus();
    }
  }, [showDescription]);

  const handleRemoveDescription = () => {
    onUpdate(item.id, "description", "");
    setShowDescription(false);
  };

  return (
    <div className="p-3 border border-gray-200 bg-white">
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
              <Button
                size="small"
                aria-label={`Move "${item.title || "item"}" up`}
                action={async () => onMoveUp()}
              >
                <img
                  src={chevronUpSvg}
                  alt=""
                  aria-hidden="true"
                  className="w-4 h-4"
                />
              </Button>
            )}
            {onMoveDown && (
              <Button
                size="small"
                aria-label={`Move "${item.title || "item"}" down`}
                action={async () => onMoveDown()}
              >
                <img
                  src={chevronDownSvg}
                  alt=""
                  aria-hidden="true"
                  className="w-4 h-4"
                />
              </Button>
            )}
            <Button
              variant="danger"
              size="small"
              action={async () => onRemove()}
            >
              Remove
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1">
            <TextInput
              ref={ref}
              id={`item-title-${item.id}`}
              type="text"
              value={item.title}
              onChange={(e) => onUpdate(item.id, "title", e.target.value)}
              placeholder="Item title"
              required
            />
          </div>
          <Button
            size="small"
            action={
              showDescription
                ? async () => handleRemoveDescription()
                : async () => setShowDescription(true)
            }
          >
            {showDescription ? "Description -" : "Description +"}
          </Button>
        </div>
      </div>
      {showDescription && (
        <div>
          <div className="flex items-start gap-2 flex-wrap">
            <textarea
              ref={descriptionRef}
              id={`item-description-${item.id}`}
              value={item.description}
              onChange={(e) => onUpdate(item.id, "description", e.target.value)}
              placeholder="Item description"
              rows={5}
              className="flex-1 px-3 py-1.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 text-sm resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ChecklistForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: ChecklistFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [items, setItems] = useState<ChecklistItem[]>(
    (initialValues?.items ?? []).map((item) => ({ ...item, id: v4() })),
  );
  const addedItemRef = useRef<HTMLInputElement>(null);
  const lastAddedId = useRef<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit?.({ title, items });
  };

  const addItem = async (index: number) => {
    const newId = v4();
    lastAddedId.current = newId;
    setItems((prev) =>
      prev.toSpliced(index, 0, { title: "", description: "", id: newId }),
    );
  };

  const updateItem = (
    id: string,
    field: keyof ChecklistItem,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
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
      <form
        onSubmit={handleSubmit}
        className="mb-4 p-4 border border-gray-200 bg-gray-50"
      >
        <div className="mb-3">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <TextInput
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter checklist title"
            required
          />
        </div>

        <div className="mb-4">
          <ol className="space-y-3 my-1">
            <Button
              size={["full", "small"]}
              action={() => addItem(0)}
            >
              + Add Item
            </Button>
            {items.map((item, index) => (
              <li key={item.id}>
                <ChecklistItemComponent
                  item={item}
                  onUpdate={updateItem}
                  onRemove={() => removeItem(item.id)}
                  onMoveUp={
                    index > 0 ? () => moveItem(index, index - 1) : undefined
                  }
                  onMoveDown={
                    index < items.length - 1
                      ? () => moveItem(index, index + 1)
                      : undefined
                  }
                  ref={
                    item.id === lastAddedId.current ? addedItemRef : undefined
                  }
                />
                <Button
                  size={['full', 'small']}
                  action={() => addItem(index + 1)}
                >
                  + Add Item
                </Button>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <div className="flex-1">
              <Button
                action={onCancel}
                type="secondary"
                size={["full", "medium"]}
              >
                Cancel
              </Button>
            </div>
          )}
          <div className="flex-2">
            <Button action="submit" type="primary" size={["full", "medium"]}>
              {submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
