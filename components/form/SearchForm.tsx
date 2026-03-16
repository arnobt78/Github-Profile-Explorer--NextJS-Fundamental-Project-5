"use client";

/**
 * Search form — controlled input + submit.
 * Syncs local state (text) with parent (userName) on submit; shows toast on empty input.
 */
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type SearchFormProps = {
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
};

export function SearchForm({ userName, setUserName }: SearchFormProps) {
  const { toast } = useToast();
  const [text, setText] = useState(userName);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (text.trim() === "") {
      toast({
        description: "Please enter a valid username",
      });
      return;
    }
    setUserName(text.trim());
  };

  return (
    <form
      onSubmit={handleSearch}
      className="mb-8 flex w-full items-center gap-x-2 lg:w-1/3"
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
        className="flex-grow bg-background"
      />
      <Button type="submit">Search</Button>
    </form>
  );
}
