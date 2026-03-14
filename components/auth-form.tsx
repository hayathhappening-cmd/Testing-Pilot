"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import { Card } from "./card";
import { Input } from "./input";
import { apiRequest, setToken } from "../lib/client-api";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        await apiRequest("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: formData.get("name"),
            company: formData.get("company"),
            email: formData.get("email"),
            password: formData.get("password"),
          }),
        });

        router.push("/login?registered=1");
        return;
      }

      const data = await apiRequest<{
        token: string;
        user: { role: "ADMIN" | "USER" };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      setToken(data.token);
      router.push(data.user.role === "ADMIN" ? "/admin" : "/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-lg">
      <div className="mb-6 space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
          {mode === "login" ? "Welcome back" : "Start your workspace"}
        </p>
        <h1 className="text-3xl font-semibold text-white">
          {mode === "login"
            ? "Login to QA Copilot"
            : "Create your QA Copilot account"}
        </h1>
        <p className="text-sm text-slate-300">
          {mode === "login"
            ? "Approved users can access the QA workspace and admin console."
            : "New registrations stay pending until an admin approves them."}
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          await onSubmit(new FormData(event.currentTarget));
        }}
      >
        {mode === "register" ? (
          <>
            <Input name="name" placeholder="Full name" required />
            <Input name="company" placeholder="Company name" />
          </>
        ) : null}
        <Input type="email" name="email" placeholder="Work email" required />
        <Input type="password" name="password" placeholder="Password" required />
        {error ? <p className="text-sm text-rose-200">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-sm text-slate-400">
        {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
        <Link href={mode === "login" ? "/register" : "/login"} className="text-cyan-200">
          {mode === "login" ? "Register" : "Login"}
        </Link>
      </p>
    </Card>
  );
}

