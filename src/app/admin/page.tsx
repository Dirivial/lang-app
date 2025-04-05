import { env } from "process";
import { HydrateClient } from "~/trpc/server";

export default async function Admin() {
  if (env.NODE_ENV !== "development") {
    return <div>No :)</div>;
  }

  return (
    <HydrateClient>
      <main className="h-screen py-2">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-full max-w-2xl">Temporary admin page</div>
        </div>
      </main>
    </HydrateClient>
  );
}
