"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function NavigatorBar() {
  const router = useRouter();
  return (
    <div className="absolute right-0 bottom-5 left-0 flex flex-col items-center justify-center">
      <div className="flex flex-row rounded-lg bg-black/10">
        <Button
          className="rounded-l-lg rounded-r-none p-6"
          onClick={() => router.push("/")}
        >
          Home
        </Button>
        <Button
          className="rounded-none p-6"
          onClick={() => router.push("/search")}
        >
          Search
        </Button>
        <Button
          className="rounded-l-none rounded-r-lg p-6"
          onClick={() => router.push("/quiz")}
        >
          Quiz
        </Button>
      </div>
    </div>
  );
}
