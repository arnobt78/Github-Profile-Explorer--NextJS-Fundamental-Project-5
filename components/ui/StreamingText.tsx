"use client";

import { useEffect, useState } from "react";

const WORDS = ["Explore", "Search", "Connect", "Code", "Build", "Learn"];

export function StreamingText() {
  const [wordIndex, setWordIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = WORDS[wordIndex];
    const timeout = isDeleting ? 80 : 150;

    if (!isDeleting) {
      if (display.length < word.length) {
        const t = setTimeout(() => setDisplay(word.slice(0, display.length + 1)), timeout);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setIsDeleting(true), 1500);
      return () => clearTimeout(t);
    }

    if (display.length > 0) {
      const t = setTimeout(() => setDisplay(display.slice(0, -1)), timeout);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setIsDeleting(false);
      setWordIndex((i) => (i + 1) % WORDS.length);
    }, 0);
    return () => clearTimeout(t);
  }, [display, isDeleting, wordIndex]);

  return (
    <span className="inline-block bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
      {display}
      <span className="animate-pulse text-foreground">|</span>
    </span>
  );
}
