import { HydrateClient } from "~/trpc/server";
import { Search } from "../_components/search";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="h-screen py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-[3rem]">
            Language <span className="text-primary">App</span>
          </h1>

          <div className="w-full max-w-2xl">
            <Search />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
