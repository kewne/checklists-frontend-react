import { useState } from "react";
import { Button } from "./Button";
import { Panel } from "./Panel";
import { TextArea } from "./TextArea";
import { TextInput } from "./TextInput";

interface MailtoFormProps {
  onGenerate: (url: string) => void;
  onCancel: () => void;
  initialValues?: MailtoValues;
}

export interface MailtoValues {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
}

export function MailtoForm({ onGenerate, onCancel, initialValues }: MailtoFormProps) {
  const [to, setTo] = useState(initialValues?.to ?? "");
  const [cc, setCc] = useState(initialValues?.cc ?? "");
  const [bcc, setBcc] = useState(initialValues?.bcc ?? "");
  const [subject, setSubject] = useState(initialValues?.subject ?? "");
  const [body, setBody] = useState(initialValues?.body ?? "");

  const handleGenerate = async () => {
    const params = [
      cc && `cc=${encodeURIComponent(cc)}`,
      bcc && `bcc=${encodeURIComponent(bcc)}`,
      subject && `subject=${encodeURIComponent(subject)}`,
      body && `body=${encodeURIComponent(body)}`,
    ].filter(Boolean).join("&");
    onGenerate(`mailto:${to}${params ? `?${params}` : ""}`);
  };

  return (
    <Panel className="p-3 mt-2">
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="mailto-to">To</label>
          <TextInput id="mailto-to" type="email" value={to} onChange={(e) => setTo(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="mailto-cc">CC</label>
          <TextInput id="mailto-cc" type="email" value={cc} onChange={(e) => setCc(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="mailto-bcc">BCC</label>
          <TextInput id="mailto-bcc" type="email" value={bcc} onChange={(e) => setBcc(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="mailto-subject">Subject</label>
          <TextInput id="mailto-subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="mailto-body">Body</label>
          <TextArea id="mailto-body" value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button action={onCancel} size="small">Cancel</Button>
          <Button action={handleGenerate} type="primary" size="small" disabled={!to}>Generate</Button>
        </div>
      </div>
    </Panel>
  );
}
