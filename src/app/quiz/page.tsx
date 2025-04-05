import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="h-screen py-2">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-full max-w-2xl">This will contain quiz stuff</div>
        </div>
      </main>
    </HydrateClient>
  );
}
