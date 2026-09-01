import { SignInAuthScreen } from "@firebase-oss/ui-react";
import { useTranslation } from "react-i18next";
import { Link, redirect, useRevalidator } from "react-router";
import { LanguageSwitcher } from "~/components/LanguageSwitcher";
import { auth } from "~/lib/firebase";
import { localePath, useLocale } from "~/lib/locale";

export async function clientLoader() {
  await auth.authStateReady()
  if (auth.currentUser) {
    return redirect("/");
  }
}

export default function Login() {
  const {revalidate} = useRevalidator()
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full">
        <SignInAuthScreen onSignIn={revalidate} />
        <div className="text-center mt-4">
          <Link
            to={localePath("/reset-password", locale)}
            className="text-blue-600 hover:underline text-sm"
          >
            {t("auth.forgotPassword")}
          </Link>
        </div>
      </div>
    </div>
  );
}
