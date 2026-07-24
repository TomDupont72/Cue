import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Saisis une adresse email valide."),
  password: z.string().min(1, "Saisis ton mot de passe.")
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères."),
    email: z.email("Saisis une adresse email valide."),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    passwordConfirmation: z.string()
  })
  .refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Les mots de passe ne correspondent pas."
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
