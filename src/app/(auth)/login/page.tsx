import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="glass-panel-solid w-full max-w-sm space-y-4 rounded-2xl p-8">
          <Skeleton className="mx-auto h-7 w-40" />
          <Skeleton className="mx-auto h-6 w-32" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
