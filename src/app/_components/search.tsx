"use client";

import { useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/app/_components/ui/command";
import { Input } from "~/app/_components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/app/_components/ui/popover";

import { api } from "~/trpc/react";

export function Search() {
  const [searchInput, setSearchInput] = useState("");
  const [open, setOpen] = useState(false);

  const { data: words } = api.word.search.useQuery(
    { text: searchInput },
    { initialData: [] },
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setOpen(e.target.value.length > 0);
            }}
            placeholder="Search..."
            className=""
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0"
        style={{ width: "var(--radix-popover-trigger-width)" }} // Exact match
        align="start"
        side="bottom"
      >
        <Command>
          <CommandList>
            {words.length === 0 ? (
              <CommandEmpty>No results found</CommandEmpty>
            ) : (
              <CommandGroup>
                {words.map((word) => (
                  <CommandItem
                    key={word.id}
                    value={word.text}
                    onSelect={() => {
                      setSearchInput(word.text);
                      setOpen(false);
                    }}
                  >
                    {word.text}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
