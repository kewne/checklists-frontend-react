import { useTranslation } from "react-i18next";
import { Logo } from "./Logo";

interface LoadingProps {
  text?: string;
}

export function Loading({ text }: LoadingProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin-logo">
        <Logo size="lg" />
      </div>
      <span className="text-gray-600 dark:text-gray-300">{text ?? t("common.loading")}</span>
    </div>
  );
}
