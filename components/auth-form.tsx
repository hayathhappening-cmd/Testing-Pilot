"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, UploadCloud, UserRound } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";
import { Input } from "./input";
import { apiRequest, setToken } from "../lib/client-api";

type Mode = "login" | "register";
type AccountType = "individual" | "company";

type RegisterFormState = {
  accountType: AccountType;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  companyWebsite: string;
  companyUsers: string;
  adminFullName: string;
  workEmail: string;
  companyPassword: string;
  companyConfirmPassword: string;
};

const initialRegisterState: RegisterFormState = {
  accountType: "individual",
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  companyName: "",
  companyWebsite: "",
  companyUsers: "5",
  adminFullName: "",
  workEmail: "",
  companyPassword: "",
  companyConfirmPassword: "",
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", tone: "text-rose-200" };
  if (score <= 3) return { label: "Medium", tone: "text-amber-100" };
  return { label: "Strong", tone: "text-emerald-100" };
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [registerForm, setRegisterForm] = useState<RegisterFormState>(initialRegisterState);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview("");
      return;
    }

    const nextPreview = URL.createObjectURL(logoFile);
    setLogoPreview(nextPreview);

    return () => URL.revokeObjectURL(nextPreview);
  }, [logoFile]);

  const activeEmail = registerForm.accountType === "individual" ? registerForm.email : registerForm.workEmail;
  const activePassword = registerForm.accountType === "individual" ? registerForm.password : registerForm.companyPassword;
  const activeConfirmPassword =
    registerForm.accountType === "individual" ? registerForm.confirmPassword : registerForm.companyConfirmPassword;
  const passwordStrength = getPasswordStrength(activePassword);

  const validation = useMemo(() => {
    if (mode !== "register") {
      return { emailValid: true, passwordsMatch: true, passwordValid: true, isValid: true };
    }

    const emailValid = activeEmail.length > 0 && isValidEmail(activeEmail);
    const passwordValid = activePassword.length >= 8;
    const passwordsMatch = activeConfirmPassword.length === 0 || activePassword === activeConfirmPassword;

    if (registerForm.accountType === "individual") {
      const isValid =
        registerForm.fullName.trim().length > 1 &&
        emailValid &&
        passwordValid &&
        activeConfirmPassword.length > 0 &&
        activePassword === activeConfirmPassword;

      return { emailValid, passwordsMatch, passwordValid, isValid };
    }

    const isValid =
      registerForm.companyName.trim().length > 1 &&
      registerForm.adminFullName.trim().length > 1 &&
      emailValid &&
      passwordValid &&
      activeConfirmPassword.length > 0 &&
      activePassword === activeConfirmPassword &&
      registerForm.companyUsers.trim().length > 0;

    return { emailValid, passwordsMatch, passwordValid, isValid };
  }, [activeConfirmPassword, activeEmail, activePassword, mode, registerForm]);

  function updateRegisterField<K extends keyof RegisterFormState>(key: K, value: RegisterFormState[K]) {
    setRegisterForm((current) => ({ ...current, [key]: value }));
  }

  function handleLogoSelection(file?: File | null) {
    if (!file) {
      setLogoFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file for the company logo.");
      return;
    }

    setError("");
    setLogoFile(file);
  }

  async function submitLogin(formData: FormData) {
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
  }

  async function submitRegister() {
    const isCompany = registerForm.accountType === "company";

    await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: isCompany ? registerForm.adminFullName : registerForm.fullName,
        company: isCompany ? registerForm.companyName : "",
        email: isCompany ? registerForm.workEmail : registerForm.email,
        password: isCompany ? registerForm.companyPassword : registerForm.password,
      }),
    });

    router.push("/login?registered=1");
  }

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        await submitRegister();
        return;
      }

      await submitLogin(formData);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function renderRegisterFields() {
    const isCompany = registerForm.accountType === "company";

    return (
      <div className="space-y-5">
        <div className="rounded-full border border-white/10 bg-slate-950/70 p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => updateRegisterField("accountType", "individual")}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition duration-200 ${
                !isCompany
                  ? "bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/25"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <UserRound className="h-4 w-4" />
              Individual
            </button>
            <button
              type="button"
              onClick={() => updateRegisterField("accountType", "company")}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition duration-200 ${
                isCompany
                  ? "bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/25"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Company
            </button>
          </div>
        </div>

        <div className="rounded-[20px] border border-amber-400/15 bg-amber-500/8 px-4 py-3 text-sm text-amber-50">
          New company accounts require admin approval.
        </div>

        <div
          className={`space-y-4 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(15,23,42,0.88))] p-6 transition-all duration-200 ${
            dragActive ? "border-cyan-300/50 bg-cyan-400/[0.06]" : ""
          }`}
        >
          <div className="space-y-1">
            <p className="text-sm font-medium text-white">Account setup</p>
            <p className="text-sm text-slate-400">
              {isCompany
                ? "Set up your admin seat first, then invite the rest of your company later."
                : "Create your personal workspace and start using QA Copilot immediately after approval."}
            </p>
          </div>

          <div
            className="space-y-4 transition-all duration-200"
            key={registerForm.accountType}
          >
            {isCompany ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    name="companyName"
                    placeholder="Company name"
                    value={registerForm.companyName}
                    onChange={(event) => updateRegisterField("companyName", event.target.value)}
                    required
                  />
                  <div>
                    <select
                      value={registerForm.companyUsers}
                      onChange={(event) => updateRegisterField("companyUsers", event.target.value)}
                      className="w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                    >
                      <option value="5">1 - 5 users</option>
                      <option value="10">6 - 10 users</option>
                      <option value="25">11 - 25 users</option>
                      <option value="50">26 - 50 users</option>
                      <option value="100">50+ users</option>
                    </select>
                  </div>
                </div>

                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                    handleLogoSelection(event.dataTransfer.files?.[0] || null);
                  }}
                  className="rounded-[24px] border border-dashed border-white/15 bg-slate-950/45 p-5 transition duration-200 hover:border-cyan-300/40 hover:bg-white/[0.03]"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleLogoSelection(event.target.files?.[0] || null)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center gap-4 text-left"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                      {logoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoPreview} alt="Company logo preview" className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <UploadCloud className="h-6 w-6 text-cyan-200" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{logoFile ? logoFile.name : "Upload company logo"}</p>
                      <p className="mt-1 text-sm text-slate-400">Drag and drop or click to upload.</p>
                    </div>
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    name="adminFullName"
                    placeholder="Admin full name"
                    value={registerForm.adminFullName}
                    onChange={(event) => updateRegisterField("adminFullName", event.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    name="workEmail"
                    placeholder="Work email"
                    value={registerForm.workEmail}
                    onChange={(event) => updateRegisterField("workEmail", event.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    type="password"
                    name="companyPassword"
                    placeholder="Password"
                    value={registerForm.companyPassword}
                    onChange={(event) => updateRegisterField("companyPassword", event.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    name="companyConfirmPassword"
                    placeholder="Confirm password"
                    value={registerForm.companyConfirmPassword}
                    onChange={(event) => updateRegisterField("companyConfirmPassword", event.target.value)}
                    required
                  />
                </div>

                <Input
                  name="companyWebsite"
                  placeholder="Company website (optional)"
                  value={registerForm.companyWebsite}
                  onChange={(event) => updateRegisterField("companyWebsite", event.target.value)}
                />
              </>
            ) : (
              <>
                <Input
                  name="fullName"
                  placeholder="Full name"
                  value={registerForm.fullName}
                  onChange={(event) => updateRegisterField("fullName", event.target.value)}
                  required
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={registerForm.email}
                  onChange={(event) => updateRegisterField("email", event.target.value)}
                  required
                />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={registerForm.password}
                  onChange={(event) => updateRegisterField("password", event.target.value)}
                  required
                />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={registerForm.confirmPassword}
                  onChange={(event) => updateRegisterField("confirmPassword", event.target.value)}
                  required
                />
              </>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <p className={`text-sm ${activeEmail.length === 0 || validation.emailValid ? "text-slate-400" : "text-rose-200"}`}>
            {activeEmail.length === 0 || validation.emailValid ? "Use a valid work email address." : "Please enter a valid email address."}
          </p>
          <p className={`text-sm md:text-right ${passwordStrength.tone}`}>
            {activePassword ? `${passwordStrength.label} password` : "Use at least 8 characters with upper, lower, and numbers."}
          </p>
          {!validation.passwordsMatch && activeConfirmPassword ? (
            <p className="text-sm text-rose-200 md:col-span-2">Passwords do not match yet.</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={loading || !validation.isValid}>
          {loading ? "Please wait..." : isCompany ? "Create Company Account" : "Create Account"}
        </Button>
      </div>
    );
  }

  if (mode === "login") {
    return (
      <Card className="mx-auto max-w-lg border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(15,23,42,0.92))]">
        <div className="mb-6 space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Welcome back</p>
          <h1 className="text-3xl font-semibold text-white">Login to QA Copilot</h1>
          <p className="text-sm text-slate-300">Approved users can access the QA workspace and admin console.</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSubmit(new FormData(event.currentTarget));
          }}
        >
          <Input type="email" name="email" placeholder="Work email" required />
          <Input type="password" name="password" placeholder="Password" required />
          {error ? <p className="text-sm text-rose-200">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : "Login"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-slate-400">
          Need an account?{" "}
          <Link href="/register" className="text-cyan-200">
            Register
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.4fr_0.6fr]">
        <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(15,23,42,0.94))] p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Start your workspace</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white lg:text-[3.25rem]">
            Create your QA Copilot account
          </h1>
          <p className="mt-5 max-w-md text-base leading-8 text-slate-300">
            Set up a personal workspace or onboard your company with a cleaner, faster registration flow built for modern QA teams.
          </p>

          <div className="mt-10 space-y-4">
            {[
              "Fast onboarding",
              "Company and individual support",
              "Secure access",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-cyan-200" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(15,23,42,0.96))] p-8 lg:p-10">
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await onSubmit(new FormData(event.currentTarget));
            }}
          >
            {renderRegisterFields()}
            {error ? <p className="text-sm text-rose-200">{error}</p> : null}
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-200">
              Login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
