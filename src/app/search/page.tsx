import { HydrateClient } from "~/trpc/server";
import { SearchComponent } from "../_components/search";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="h-screen py-2">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-full max-w-2xl">
            <SearchComponent />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
