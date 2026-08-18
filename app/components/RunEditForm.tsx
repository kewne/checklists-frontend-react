import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { v4 } from "uuid";
import { TextArea } from "~/components/TextArea";
import { TextInput } from "~/components/TextInput";
import { ChevronDown } from "~/icons/ChevronDown";
import { ChevronUp } from "~/icons/ChevronUp";
import type { ChecklistRun, WriteableChecklistRun } from "~/lib/api";
import { Button } from "./Button";
import { MailtoForm, type MailtoValues } from "./MailtoForm";
import { Panel } from "./Panel";

interface RunEditFormProps {
  initialValues: ChecklistRun;
  submitLabel: string;
  onSubmit?: (data: WriteableChecklistRun) => Promise<void>;
  onCancel?: () => void | Promise<void>;
}

interface RunItemComponentProps {
  item: WriteableChecklistRun["items"][number];
  onUpdate: (
    name: string,
    field: "title" | "description",
    value: string,
  ) => void;
  onRemove: () => void | Promise<void>;
  onMoveUp?: () => void | Promise<void>;
  onMoveDown?: () => void | Promise<void>;
  ref?: React.Ref<HTMLInputElement>;
}

function RunItemComponent({
  item,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  ref,
}: RunItemComponentProps) {
  const { t } = useTranslation();
  const [showDescription, setShowDescription] = useState(
    item.description?.length > 0,
  );
  const [showMailtoForm, setShowMailtoForm] = useState(false);
  const [mailtoInitialValues, setMailtoInitialValues] = useState<MailtoValues | undefined>(undefined);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const handleRemoveDescription = async () => {
    onUpdate(item.name, "description", "");
    setShowDescription(false);
    setShowMailtoForm(false);
  };

  const handleMailtoGenerate = (url: string) => {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    textarea.setRangeText(url, textarea.selectionStart, textarea.selectionEnd, "select");
    // trigger React's onChange by dispatching a native input event
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
    <Panel className="p-4">
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor={`item-title-${item.name}`}
            className="text-xs font-medium text-gray-600"
          >
            {t("common.title")}
          </label>
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <Button
                size="small"
                action={onMoveUp}
                aria-label={t("common.moveUp", { title: item.title || t("common.itemFallback") })}
              >
                <ChevronUp />
              </Button>
            )}
            {onMoveDown && (
              <Button
                size="small"
                action={onMoveDown}
                aria-label={t("common.moveDown", { title: item.title || t("common.itemFallback") })}
              >
                <ChevronDown />
              </Button>
            )}
            <Button variant="danger" size="small" action={onRemove}>
              {t("common.remove")}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1">
            <TextInput
              ref={ref}
              id={`item-title-${item.name}`}
              type="text"
              value={item.title}
              onChange={(e) => onUpdate(item.name, "title", e.target.value)}
              placeholder={t("run.itemTitlePlaceholder")}
              required
            />
          </div>
          <Button
            size="small"
            action={
              showDescription
                ? handleRemoveDescription
                : async () => setShowDescription(true)
            }
          >
            <label htmlFor={`item-description-${item.name}`}>
              {showDescription ? t("common.descriptionHide") : t("common.descriptionShow")}
            </label>
          </Button>
        </div>
      </div>
      {showDescription && (
        <div>
          <div className="flex items-start gap-2 flex-wrap">
            <TextArea
              ref={descriptionRef}
              id={`item-description-${item.name}`}
              value={item.description}
              onChange={(e) =>
                onUpdate(item.name, "description", e.target.value)
              }
              placeholder={t("checklist.itemDescriptionPlaceholder")}
              rows={5}
              className="flex-1 py-1.5"
            />
            <Button
              size="small"
              action={handleOpenMailtoForm}
            >
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

export function RunEditForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: RunEditFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialValues.title);
  const [items, setItems] = useState<WriteableChecklistRun["items"]>(
    initialValues.items.map(({ completed: _completed, ...item }) => item),
  );
  const addedItemRef = useRef<HTMLInputElement>(null);
  const lastAddedId = useRef<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit?.({ title, items });
  };

  const addItem = (index: number) => {
    const newId = v4();
    lastAddedId.current = newId;
    setItems((prev) =>
      prev.toSpliced(index, 0, { name: newId, title: "", description: "" }),
    );
  };

  const updateItem = (
    name: string,
    field: "title" | "description",
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.name === name ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeItem = (name: string) => {
    setItems((prev) => prev.filter((item) => item.name !== name));
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
        className="mb-4 p-4"
      >
        <Panel className="mb-3">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("common.title")}
          </label>
          <TextInput
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("run.titlePlaceholder")}
            required
            autoFocus
          />
        </Panel>

        <div className="mb-4">
          <ol className="space-y-3 my-1">
            <Button size={["full", "small"]} action={async () => addItem(0)}>
              {t("common.addItem")}
            </Button>
            {items.map((item, index) => (
              <li key={item.name}>
                <RunItemComponent
                  item={item}
                  onUpdate={updateItem}
                  onRemove={() => removeItem(item.name)}
                  onMoveUp={
                    index > 0 ? () => moveItem(index, index - 1) : undefined
                  }
                  onMoveDown={
                    index < items.length - 1
                      ? () => moveItem(index, index + 1)
                      : undefined
                  }
                  ref={
                    item.name === lastAddedId.current ? addedItemRef : undefined
                  }
                />
                <Button
                  size={["full", "small"]}
                  action={async () => addItem(index + 1)}
                >
                  {t("common.addItem")}
                </Button>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            {onCancel && (
              <Button action={onCancel} size={["full", "large"]}>
                {t("common.cancel")}
              </Button>
            )}
          </div>
          <div className="flex-2">
            <Button action="submit" type="primary" size={["full", "large"]}>
              {submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
