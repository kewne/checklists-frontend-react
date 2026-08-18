import {
  enUs,
  registerLocale,
  type RegisteredLocale,
  type Translations,
} from "@firebase-oss/ui-translations";

/**
 * Translations for the Firebase UI auth screens (sign-in, password reset).
 * Any missing key falls back to the built-in English locale.
 */

const ptTranslations: Translations = {
  errors: {
    userNotFound: "Utilizador não encontrado.",
    wrongPassword: "Palavra-passe incorreta.",
    invalidEmail: "Endereço de e-mail inválido.",
    userDisabled: "Esta conta foi desativada.",
    networkRequestFailed: "Falha de rede. Verifique a sua ligação.",
    tooManyRequests: "Demasiadas tentativas. Tente novamente mais tarde.",
    emailAlreadyInUse: "Este e-mail já está a ser utilizado.",
    invalidCredential: "Credenciais inválidas.",
    weakPassword: "A palavra-passe é demasiado fraca.",
    unknownError: "Ocorreu um erro inesperado.",
  },
  messages: {
    passwordResetEmailSent: "E-mail de reposição de palavra-passe enviado.",
    checkEmailForReset:
      "Verifique o seu e-mail para obter instruções de reposição da palavra-passe.",
    dividerOr: "ou",
  },
  labels: {
    emailAddress: "Endereço de e-mail",
    password: "Palavra-passe",
    displayName: "Nome",
    forgotPassword: "Esqueceu-se da palavra-passe?",
    signIn: "Iniciar sessão",
    signUp: "Registar",
    resetPassword: "Repor palavra-passe",
    createAccount: "Criar conta",
    backToSignIn: "Voltar ao início de sessão",
    sending: "A enviar...",
  },
  prompts: {
    noAccount: "Ainda não tem conta?",
    haveAccount: "Já tem conta?",
    enterEmailToReset: "Introduza o seu e-mail para repor a palavra-passe",
    signInToAccount: "Inicie sessão na sua conta",
    enterDetailsToCreate: "Introduza os seus dados para criar uma conta",
  },
};

const esTranslations: Translations = {
  errors: {
    userNotFound: "Usuario no encontrado.",
    wrongPassword: "Contraseña incorrecta.",
    invalidEmail: "Dirección de correo electrónico no válida.",
    userDisabled: "Esta cuenta ha sido desactivada.",
    networkRequestFailed: "Error de red. Comprueba tu conexión.",
    tooManyRequests: "Demasiados intentos. Inténtalo de nuevo más tarde.",
    emailAlreadyInUse: "Este correo electrónico ya está en uso.",
    invalidCredential: "Credenciales no válidas.",
    weakPassword: "La contraseña es demasiado débil.",
    unknownError: "Se produjo un error inesperado.",
  },
  messages: {
    passwordResetEmailSent:
      "Correo de restablecimiento de contraseña enviado.",
    checkEmailForReset:
      "Revisa tu correo electrónico para obtener instrucciones para restablecer la contraseña.",
    dividerOr: "o",
  },
  labels: {
    emailAddress: "Correo electrónico",
    password: "Contraseña",
    displayName: "Nombre",
    forgotPassword: "¿Olvidaste tu contraseña?",
    signIn: "Iniciar sesión",
    signUp: "Registrarse",
    resetPassword: "Restablecer contraseña",
    createAccount: "Crear cuenta",
    backToSignIn: "Volver a iniciar sesión",
    sending: "Enviando...",
  },
  prompts: {
    noAccount: "¿No tienes una cuenta?",
    haveAccount: "¿Ya tienes una cuenta?",
    enterEmailToReset:
      "Introduce tu correo electrónico para restablecer la contraseña",
    signInToAccount: "Inicia sesión en tu cuenta",
    enterDetailsToCreate: "Introduce tus datos para crear una cuenta",
  },
};

export const ptLocale: RegisteredLocale = registerLocale("pt", ptTranslations, enUs);
export const esLocale: RegisteredLocale = registerLocale("es", esTranslations, enUs);

export const firebaseUiLocales: Record<string, RegisteredLocale> = {
  pt: ptLocale,
  es: esLocale,
};
