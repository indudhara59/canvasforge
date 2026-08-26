"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Layers, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

export function RegisterForm() {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const validate = () => {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!email) next.email = "Email is required.";
    else if (!EMAIL_REGEX.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Must be at least 8 characters.";
    if (confirmPassword !== password) next.confirmPassword = "Passwords do not match.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrors({ form: data.error ?? "Something went wrong. Please try again." });
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", { email, password, redirect: false });

      if (result?.error) {
        setIsLoading(false);
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-panel-solid relative z-10 w-full max-w-sm rounded-2xl p-8"
    >
      <Link href="/" className="mb-8 flex items-center justify-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Layers className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold tracking-tight">PixelForge Studio</span>
      </Link>

      <h1 className="text-center text-xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-1.5 text-center text-sm text-muted-foreground">
        Start designing in the next 30 seconds.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
        {errors.form && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {errors.form}
          </motion.p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Ada Lovelace"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Creating account…" : "Create account"}
          </Button>
        </motion.div>
      </form>

      <Separator className="my-6" />

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
