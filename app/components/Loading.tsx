import { useTranslation } from "react-i18next";
import { Logo } from "./Logo";

interface LoadingProps {
  text?: string;
  animation?: "spin" | "ping";
}

export function Loading({ text, animation = "spin" }: LoadingProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-4">
      {animation === "ping" ? (
        <div className="relative w-16 h-16">
          <Logo size="lg" />
          <div className="absolute inset-0 animate-ping" aria-hidden="true">
            <Logo size="lg" />
          </div>
        </div>
      ) : (
        <div className="animate-spin-logo">
          <Logo size="lg" />
        </div>
      )}
      <span className="text-gray-600 dark:text-gray-300">{text ?? t("common.loading")}</span>
    </div>
  );
}

export function LoadingScreen({
  animation,
}: Pick<LoadingProps, "animation">) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="max-w-4xl mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[50vh] gap-6"
    >
      <Loading animation={animation} />
    </div>
  );
}
