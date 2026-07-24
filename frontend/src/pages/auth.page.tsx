import { AuthForm } from "@/features/auth/components/authForm";

export default function Auth() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/30 px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.08),transparent_35%)]" />

      <div className="relative flex w-full flex-col items-center gap-8">
        <AuthForm />
      </div>
    </main>
  );
}
