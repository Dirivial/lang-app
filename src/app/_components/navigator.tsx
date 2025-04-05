"use client";

import { House } from "lucide-react";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { ThemeToggle } from "./theme";

export function NavigatorBar() {
  return (
    <div className="flex w-full flex-col justify-center align-middle">
      <div className="flex h-16 flex-row align-middle xl:mx-auto xl:w-[79rem]">
        <Separator orientation="vertical" className="hidden xl:inline" />
        <Link
          href={"/"}
          className="flex flex-col justify-center px-2 pl-2 text-center align-middle text-xl font-extrabold tracking-tight transition-all hover:bg-zinc-900/15 sm:text-xl"
        >
          <span className="px-2 sm:hidden">
            <House />
          </span>
          <span className="hidden pb-1 sm:inline">
            Language <span className="text-primary">App</span>
          </span>
        </Link>
        <Separator orientation="vertical" />
        <div className="flex flex-grow flex-row">
          <Link
            className="text-foreground/80 hover:text-foreground pr-1 pl-2 transition-all"
            href={"/search"}
          >
            <div className="flex h-full flex-col justify-center">Search</div>
          </Link>

          <Link
            className="text-foreground/80 hover:text-foreground px-1 text-center transition-all"
            href={"/quiz"}
          >
            <div className="flex h-full flex-col justify-center">Quiz</div>
          </Link>
        </div>
        <div className="flex">
          <div className="my-auto pr-6">
            <ThemeToggle />
          </div>
          <Separator orientation="vertical" className="hidden xl:inline" />
        </div>
      </div>
      <Separator className="w-full" />
    </div>
  );
}
