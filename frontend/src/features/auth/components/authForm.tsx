import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthForm, type AuthMode } from "@/features/auth/hooks/useAuthForm";

type FieldProps = React.ComponentProps<typeof Input> & {
  label: string;
};

function Field({ id, label, ...props }: FieldProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input id={id} {...props} />
    </div>
  );
}

export function AuthForm() {
  const {
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
  } = useAuthForm();

  return (
    <Card className="w-full max-w-md shadow-xl shadow-black/5">
      <CardContent>
        <Tabs
          value={mode}
          onValueChange={(value) => changeMode(value as AuthMode)}
          className="gap-5"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Connexion</TabsTrigger>
            <TabsTrigger value="sign-up">Inscription</TabsTrigger>
          </TabsList>

          {error && (
            <div
              role="alert"
              className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <TabsContent value="sign-in">
            <form className="grid gap-4" onSubmit={signIn}>
              <Field
                id="sign-in-email"
                label="Email"
                type="email"
                autoComplete="email"
                value={signInValues.email}
                onChange={(event) =>
                  setSignInValues((values) => ({ ...values, email: event.target.value }))
                }
                required
              />
              <Field
                id="sign-in-password"
                label="Mot de passe"
                type="password"
                autoComplete="current-password"
                value={signInValues.password}
                onChange={(event) =>
                  setSignInValues((values) => ({ ...values, password: event.target.value }))
                }
                required
              />
              <Button type="submit" className="mt-1 w-full" disabled={isPending}>
                {isPending && <Spinner />}
                Se connecter
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="sign-up">
            <form className="grid gap-4" onSubmit={signUp}>
              <Field
                id="sign-up-name"
                label="Nom"
                autoComplete="name"
                value={signUpValues.name}
                onChange={(event) =>
                  setSignUpValues((values) => ({ ...values, name: event.target.value }))
                }
                required
              />
              <Field
                id="sign-up-email"
                label="Email"
                type="email"
                autoComplete="email"
                value={signUpValues.email}
                onChange={(event) =>
                  setSignUpValues((values) => ({ ...values, email: event.target.value }))
                }
                required
              />
              <Field
                id="sign-up-password"
                label="Mot de passe"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={signUpValues.password}
                onChange={(event) =>
                  setSignUpValues((values) => ({ ...values, password: event.target.value }))
                }
                required
              />
              <Field
                id="sign-up-password-confirmation"
                label="Confirmer le mot de passe"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={signUpValues.passwordConfirmation}
                onChange={(event) =>
                  setSignUpValues((values) => ({
                    ...values,
                    passwordConfirmation: event.target.value
                  }))
                }
                required
              />
              <Button type="submit" className="mt-1 w-full" disabled={isPending}>
                {isPending && <Spinner />}
                Créer mon compte
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
