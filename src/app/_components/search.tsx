"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/app/_components/ui/command";
import { Input } from "~/app/_components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/app/_components/ui/popover";
import { useDebounce } from "use-debounce";

import { api } from "~/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { MoveHorizontal, MoveRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export const searchModes = ["SV->DE", "DE->SV", "SV", "DE", "SV<->DE"] as const;
export type SearchMode = (typeof searchModes)[number];

export function isValidSearchMode(mode: string): mode is SearchMode {
  return searchModes.includes(mode as SearchMode);
}

export function SearchComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<SearchMode>("SV<->DE");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 300);

  const { data: words, refetch: refetchSearch } = api.word.search.useQuery(
    { text: debouncedSearch },
    { initialData: [], enabled: debouncedSearch.length > 0 },
  );

  useEffect(() => {
    if (debouncedSearch.length > 0) {
      void refetchSearch();
    }
  }, [debouncedSearch]);

  function handleModeSelect(newMode: SearchMode) {
    setMode(newMode);
  }

  function handleUpdateSearchURL() {
    // Update URL with serach string
    void router.push("/search?m=" + mode + "&s=" + searchInput);
  }

  useEffect(() => {
    const paramSearch = searchParams.get("s");
    if (paramSearch) {
      setSearchInput(paramSearch);
    }
    const modeToSet = searchParams.get("m");
    if (modeToSet && isValidSearchMode(modeToSet)) {
      setMode(modeToSet);
    }
  }, [searchParams]);

  return (
    <div className="m-2 flex flex-col gap-1 sm:m-1 sm:flex-row">
      <ModeSelect mode={mode} setMode={handleModeSelect} />
      <Search
        selectSearch={handleUpdateSearchURL}
        searchInput={searchInput}
        words={words}
        setSearchInput={setSearchInput}
      />
    </div>
  );
}

function ModeSelect(props: {
  mode: SearchMode;
  setMode: (mode: SearchMode) => void;
}) {
  return (
    <div className="flex justify-center">
      <Select
        value={props.mode}
        onValueChange={(value) => props.setMode(value as SearchMode)}
      >
        <SelectTrigger className="w-[210px]">
          <SelectValue placeholder="Select mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="SV<->DE">
            <Image
              src={"/countries/se.svg"}
              alt="Swedish flag"
              width={20}
              height={20}
            />
            SV <MoveHorizontal />
            DE
            <Image
              src={"/countries/de.svg"}
              alt="German flag"
              width={20}
              height={20}
            />
          </SelectItem>
          <SelectItem value="SV->DE">
            <Image
              src={"/countries/se.svg"}
              alt="Swedish flag"
              width={20}
              height={20}
            />
            SV <MoveRight /> DE
            <Image
              src={"/countries/de.svg"}
              alt="German flag"
              width={20}
              height={20}
            />
          </SelectItem>
          <SelectItem value="DE->SV">
            <Image
              src={"/countries/de.svg"}
              alt="German flag"
              width={20}
              height={20}
            />
            DE <MoveRight />
            SV
            <Image
              src={"/countries/se.svg"}
              alt="Swedish flag"
              width={20}
              height={20}
            />
          </SelectItem>
          <SelectItem value="SV">
            SV
            <Image
              src={"/countries/se.svg"}
              alt="Swedish flag"
              width={20}
              height={20}
            />
          </SelectItem>
          <SelectItem value="DE">
            DE
            <Image
              src={"/countries/de.svg"}
              alt="German flag"
              width={20}
              height={20}
            />
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function Search(props: {
  searchInput: string;
  words: { text: string; id: number; languageId: number }[];
  setSearchInput: (search: string) => void;
  selectSearch: (search?: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      setOpen(false);
      props.selectSearch();
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            ref={inputRef}
            value={props.searchInput}
            onChange={(e) => {
              props.setSearchInput(e.target.value);
              setOpen(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyDown}
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
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {props.words.length === 0 ? (
              <CommandEmpty>No results found</CommandEmpty>
            ) : (
              <CommandGroup>
                {props.words.map((word) => (
                  <CommandItem
                    key={word.id}
                    value={word.text}
                    onSelect={() => {
                      setOpen(false);
                      props.setSearchInput(word.text);
                      props.selectSearch(word.text);
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
