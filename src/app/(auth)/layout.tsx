import { AnimatedBackground } from "@/components/marketing/animated-background";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <AnimatedBackground />
      {children}
    </main>
  );
}
