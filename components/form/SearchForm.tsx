"use client";

/**
 * Search form: controlled input + Search button. On submit, validates, adds to recent
 * history, and updates global userName (SearchContext) so UserProfile refetches.
 */
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSearchHistory } from "@/hooks/useSearchHistory";

type SearchFormProps = {
  userName: string;
  setUserName: (username: string) => void;
};

export function SearchForm({ userName, setUserName }: SearchFormProps) {
  const { toast } = useToast();
  const { addSearch } = useSearchHistory();
  const [text, setText] = useState(userName);

  /** Validate, add to history, then update global username to trigger profile fetch. */
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (text.trim() === "") {
      toast({
        description: "Please enter a valid username",
      });
      return;
    }
    const trimmed = text.trim();
    addSearch(trimmed);
    setUserName(trimmed);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex w-full items-center gap-x-2"
    >
      <Label htmlFor="search" className="sr-only">
        Search
      </Label>
      <Input
        type="text"
        id="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search Github Users... "
        className="flex-grow bg-background transition-none"
      />
      <Button type="submit" className="transition-none">Search</Button>
    </form>
  );
}
