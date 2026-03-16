import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/provider/Providers";

export const metadata: Metadata = {
  title: "GitHub User Explorer | Search & Visualize GitHub Profiles",
  description:
    "Effortlessly search and visualize GitHub user profiles, repositories, and language stats with interactive charts. Powered by GraphQL, Apollo Client, and a modern UI. Author: Arnob Mahmud.",
  keywords:
    "GitHub, User Search, GraphQL, Apollo Client, React, Next.js, TypeScript, Tailwind CSS, Data Visualization, Arnob Mahmud",
  authors: [{ name: "Arnob Mahmud" }],
  openGraph: {
    title: "GitHub User Explorer | Search & Visualize GitHub Profiles",
    description:
      "Effortlessly search and visualize GitHub user profiles, repositories, and language stats with interactive charts. Powered by GraphQL, Apollo Client, and a modern UI.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub User Explorer | Search & Visualize GitHub Profiles",
    description:
      "Effortlessly search and visualize GitHub user profiles, repositories, and language stats with interactive charts. Powered by GraphQL, Apollo Client, and a modern UI.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
