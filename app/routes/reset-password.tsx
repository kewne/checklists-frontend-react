import { ForgotPasswordAuthForm } from '@firebase-oss/ui-react';
import { useLocaleNavigate } from '~/lib/locale';
import { Logo } from '~/components/Logo';

export default function ResetPassword() {
    const navigate = useLocaleNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
            <div className="max-w-md w-full flex flex-col items-center">
                <div className="mb-8">
                    <Logo size="lg" />
                </div>
                <ForgotPasswordAuthForm
                    onBackToSignInClick={() => navigate('/login')}
                    onPasswordSent={() => navigate('/login')}
                />
            </div>
        </div>
    );
}
