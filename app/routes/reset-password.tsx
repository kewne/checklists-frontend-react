import { ForgotPasswordAuthForm } from '@firebase-oss/ui-react';
import { useLocaleNavigate } from '~/lib/locale';

export default function ResetPassword() {
    const navigate = useLocaleNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full">
                <ForgotPasswordAuthForm
                    onBackToSignInClick={() => navigate('/login')}
                    onPasswordSent={() => navigate('/login')}
                />
            </div>
        </div>
    );
}
