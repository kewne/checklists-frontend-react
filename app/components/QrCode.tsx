import { useEffect, useState } from "react";
import { toDataURL } from "qrcode";

interface QrCodeProps {
  value: string;
  className?: string;
}

export function QrCode({ value, className }: QrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    toDataURL(value, { margin: 1, width: 256 }).then((url) => {
      if (!cancelled) {
        setDataUrl(url);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!dataUrl) {
    return null;
  }

  return (
    <img
      src={dataUrl}
      alt={`QR code linking to ${value}`}
      className={className}
    />
  );
}
