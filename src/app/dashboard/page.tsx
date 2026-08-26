import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}.
      </h1>
      <p className="mt-2 text-muted-foreground">
        Your projects will show up here. This is a placeholder — the canvas and
        project list come in a later phase.
      </p>
    </div>
  );
}
