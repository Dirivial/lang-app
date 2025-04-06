"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { api } from "~/trpc/react";

type WordThing = {
  text: string;
  type: "noun";
  article: string;
  gender: string;
  definitions: string[];
  synonyms: string[];
  examples: string[];
  frequency: number;
  source: string;
  audio: string;
  languageId: number;
};

export function WordThing() {
  const [wordInput, setWordInput] = useState("");

  const addWordsMutation = api.word.createMany.useMutation();

  async function doThing() {
    addWordsMutation
      .mutateAsync(handleData(wordInput))
      .catch((e) => console.error(e));
  }

  return (
    <div className="flex w-full flex-col justify-center align-middle">
      <textarea
        onChange={(e) => setWordInput(e.target.value)}
        value={wordInput}
      />
      <Button onClick={doThing}>Do thing</Button>
    </div>
  );
}

function handleData(data: string): WordThing[] {
  // Split into individual word entries
  const wordEntries = data.split("\n\n").filter((entry) => entry.trim() !== "");

  // Parse each entry
  const nouns: WordThing[] = wordEntries.map((entry) => {
    const lines = entry.split("\n");
    const noun: WordThing = {
      text: "",
      article: "",
      gender: "",
      definitions: [],
      synonyms: [],
      examples: [],
      frequency: 0,
      source: "",
      audio: "",
      languageId: 2,
      type: "noun",
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();

      if (line === "[Noun]") {
        noun.text = lines[++i]?.trim() ?? "";
      } else if (line === "[Article]") {
        noun.article = lines[++i]?.trim() ?? "";
        // Derive gender from article
        noun.gender =
          noun.article === "der"
            ? "m"
            : noun.article === "die"
              ? "f"
              : noun.article === "das"
                ? "n"
                : "unknown";
      } else if (line?.startsWith("[Meaning")) {
        noun.definitions.push(
          lines[++i]
            ?.trim()
            .replace(/&auml;/g, "ä")
            .replace(/&ouml;/g, "ö")
            .replace(/&uuml;/g, "ü")
            .replace(/&szlig;/g, "ß")
            .replace(/&Auml;/g, "Ä")
            .replace(/&Ouml;/g, "Ö")
            .replace(/&Uuml;/g, "Ü") ?? "",
        );
      } else if (line === "[Sample Sentence]") {
        const l = lines[++i]?.trim() ?? "";
        if (l.length > 0) {
          noun.examples.push(l);
        }
      } else if (line === "[Synonyms]") {
        noun.synonyms = lines[++i]?.trim().split(/\s*,\s*/) ?? [];
      } else if (line === "[Frequency]") {
        noun.frequency = parseInt(lines[++i]?.trim() ?? "");
      } else if (line === "[Source]") {
        noun.source = lines[++i]?.trim() ?? "";
      } else if (line === "[Audio]") {
        const audioLine = lines[++i]?.trim();
        const audioMatch = audioLine?.match(/\[sound:(.+?)\]/);
        if (audioMatch) {
          noun.audio = audioMatch[1] ?? "";
        }
      }
    }

    return noun;
  });

  // Output the parsed data
  //console.log(JSON.stringify(nouns, null, 2));
  return nouns;
}
