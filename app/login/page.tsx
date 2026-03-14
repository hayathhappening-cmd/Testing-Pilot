import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; pending?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="space-y-6 py-10">
      {params.registered ? (
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100">
          Registration submitted. Your account needs admin approval before login.
        </div>
      ) : null}
      {params.pending ? (
        <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-50">
          Your account is still waiting for admin approval.
        </div>
      ) : null}
      <AuthForm mode="login" />
    </main>
  );
}

