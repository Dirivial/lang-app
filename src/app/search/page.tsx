import { HydrateClient } from "~/trpc/server";
import { SearchComponent } from "../_components/search";
import { Suspense } from "react";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="h-screen py-2">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-full max-w-2xl">
            <Suspense
              fallback={
                <div className="flex w-full flex-col gap-4">Hello brothers</div>
              }
            >
              <SearchComponent />
            </Suspense>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
