/**
 * Site footer: centered copyright line with current year.
 * Rendered in root layout below main content.
 */
import { MdCopyright } from "react-icons/md";

export function Footer() {
  return (
    <footer className="flex justify-center py-6 text-center text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <MdCopyright className="h-4 w-4" aria-hidden />
        {new Date().getFullYear()}. All reserved.
      </span>
    </footer>
  );
}
