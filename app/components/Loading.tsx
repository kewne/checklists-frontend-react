import { useTranslation } from "react-i18next";

interface LoadingProps {
  text?: string;
}

export function Loading({ text }: LoadingProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center">
      <div className="animate-spin h-5 w-5 border-b-2 border-indigo-600 dark:border-emerald-600 mr-3"></div>
      <span className="text-gray-600 dark:text-gray-300">{text ?? t("common.loading")}</span>
    </div>
  );
}
