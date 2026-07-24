import { useState, type FormEvent } from "react";

import { authClient } from "@/lib/authClient";
import {
  signInSchema,
  signUpSchema,
  type SignInInput,
  type SignUpInput
} from "@/features/auth/schemas/auth.schemas";

export type AuthMode = "sign-in" | "sign-up";

const initialSignIn: SignInInput = {
  email: "",
  password: ""
};

const initialSignUp: SignUpInput = {
  name: "",
  email: "",
  password: "",
  passwordConfirmation: ""
};

function firstValidationError(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Le formulaire est invalide.";
}

export function useAuthForm() {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [signInValues, setSignInValues] = useState(initialSignIn);
  const [signUpValues, setSignUpValues] = useState(initialSignUp);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = signInSchema.safeParse(signInValues);

    if (!parsed.success) {
      setError(firstValidationError(parsed.error));
      return;
    }

    setIsPending(true);

    try {
      const result = await authClient.signIn.email(parsed.data);

      if (result.error) {
        setError(result.error.message ?? "Email ou mot de passe incorrect.");
      }
    } catch {
      setError("Impossible de joindre le serveur. Réessaie dans quelques instants.");
    } finally {
      setIsPending(false);
    }
  }

  async function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = signUpSchema.safeParse(signUpValues);

    if (!parsed.success) {
      setError(firstValidationError(parsed.error));
      return;
    }

    setIsPending(true);

    try {
      const result = await authClient.signUp.email({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password
      });

      if (result.error) {
        setError(result.error.message ?? "Impossible de créer ce compte.");
      }
    } catch {
      setError("Impossible de joindre le serveur. Réessaie dans quelques instants.");
    } finally {
      setIsPending(false);
    }
  }

  return {
    mode,
    changeMode,
    signInValues,
    setSignInValues,
    signUpValues,
    setSignUpValues,
    error,
    isPending,
    signIn,
    signUp
  };
}
