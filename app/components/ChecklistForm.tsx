import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { v4 } from "uuid";
import { Button } from "~/components/Button";
import { Panel } from "~/components/Panel";
import { TextArea } from "~/components/TextArea";
import { TextInput } from "~/components/TextInput";
import { ChevronDown } from "~/icons/ChevronDown";
import { ChevronUp } from "~/icons/ChevronUp";
import type { Checklist, ChecklistItem } from "~/lib/api";
import { MailtoForm, type MailtoValues } from "./MailtoForm";

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
  const { t } = useTranslation();
  const [showDescription, setShowDescription] = useState(
    item.description.length > 0,
  );
  const [showMailtoForm, setShowMailtoForm] = useState(false);
  const [mailtoInitialValues, setMailtoInitialValues] = useState<MailtoValues | undefined>(undefined);
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
    setShowMailtoForm(false);
  };

  const handleMailtoGenerate = (url: string) => {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    textarea.setRangeText(url, textarea.selectionStart, textarea.selectionEnd, "select");
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    setShowMailtoForm(false);
  };

  const parseMailtoSelection = (): MailtoValues | undefined => {
    const ta = descriptionRef.current;
    if (!ta) return undefined;
    const selected = ta.value.substring(ta.selectionStart, ta.selectionEnd).trim();
    try {
      const url = new URL(selected);
      if (url.protocol !== "mailto:") return undefined;
      return {
        to: url.pathname,
        cc: url.searchParams.get("cc") ?? "",
        bcc: url.searchParams.get("bcc") ?? "",
        subject: url.searchParams.get("subject") ?? "",
        body: url.searchParams.get("body") ?? "",
      };
    } catch {
      return undefined;
    }
  };

  const handleOpenMailtoForm = async () => {
    if (!showMailtoForm) {
      setMailtoInitialValues(parseMailtoSelection());
    }
    setShowMailtoForm((v) => !v);
  };

  return (
    <Panel className="my-4">
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor={`item-title-${item.id}`}
            className="text-xs font-medium text-gray-600 dark:text-gray-300"
          >
            {t("checklist.stepTitle")}
          </label>
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <Button
                size="small"
                aria-label={t("common.moveUp", { title: item.title || t("common.itemFallback") })}
                action={async () => onMoveUp()}
              >
                <ChevronUp />
              </Button>
            )}
            {onMoveDown && (
              <Button
                size="small"
                aria-label={t("common.moveDown", { title: item.title || t("common.itemFallback") })}
                action={async () => onMoveDown()}
              >
                <ChevronDown />
              </Button>
            )}
            <Button
              variant="danger"
              size="small"
              action={async () => onRemove()}
            >
              {t("common.remove")}
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
              placeholder={t("checklist.stepTitlePlaceholder")}
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
            {showDescription ? t("common.descriptionHide") : t("common.descriptionShow")}
          </Button>
        </div>
      </div>
      {showDescription && (
        <div>
          <div className="flex items-start gap-2 flex-wrap">
            <TextArea
              ref={descriptionRef}
              id={`item-description-${item.id}`}
              value={item.description}
              onChange={(e) => onUpdate(item.id, "description", e.target.value)}
              placeholder={t("checklist.itemDescriptionPlaceholder")}
              rows={5}
              className="flex-1 py-1.5"
            />
            <Button size="small" action={handleOpenMailtoForm}>
              mailto {showMailtoForm ? "-" : "+"}
            </Button>
          </div>
          {showMailtoForm && (
            <MailtoForm
              initialValues={mailtoInitialValues}
              onGenerate={handleMailtoGenerate}
              onCancel={() => setShowMailtoForm(false)}
            />
          )}
        </div>
      )}
    </Panel>
  );
}

export function ChecklistForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: ChecklistFormProps) {
  const { t } = useTranslation();
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
        className="mb-4"
      >
        <Panel>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
          >
            {t("common.title")}
          </label>
          <TextInput
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("checklist.titlePlaceholder")}
            required
            autoFocus
          />
        </Panel>

        <div className="mt-20 mb-4">
          <ol className="space-y-3">
            <div className="mr-1 ml-auto">
            <Button
              size={["full", "small"]}
              action={() => addItem(0)}
            >
              {t("common.addItem")}
            </Button>
            </div>
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
                  {t("common.addItem")}
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
                {t("common.cancel")}
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
