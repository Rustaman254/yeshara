"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as api from "@/lib/api";
import { AuthLayout, authInput } from "@/components/AuthLayout";

export default function OwnerSignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await api.ownerRegister(email, password, fullName);
      api.setOwnerSessionToken(token);
      router.push("/owner/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an owner account"
      subtitle="Registering doesn't grant access on its own — an admin links your account to your offering after verifying ownership."
      footer={
        <>
          Already registered?{" "}
          <Link href="/owner/sign-in" className="text-violet-600 dark:text-violet-400 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Full name</label>
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={authInput} />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={authInput} />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInput}
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
