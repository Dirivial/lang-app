import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import {
  LoginHistory,
  LoginHistoryCardSkeleton,
} from "./_components/dashboard-stats";
import { Suspense } from "react";
import { AuthShowcase } from "./_components/auth-showcase";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="container h-screen py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Language <span className="text-primary">App</span>
          </h1>

          <AuthShowcase />

          <div className="w-full max-w-2xl overflow-y-scroll">
            <Suspense
              fallback={
                <div className="flex w-full flex-col gap-4">
                  <LoginHistoryCardSkeleton />
                  <LoginHistoryCardSkeleton />
                  <LoginHistoryCardSkeleton />
                </div>
              }
            >
              <LoginHistory />
            </Suspense>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
