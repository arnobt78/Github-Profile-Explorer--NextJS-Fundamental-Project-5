import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/provider/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const siteUrl = "https://github-dev-explorer.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GitHub Profile Explorer | Search & Visualize GitHub Profiles with GraphQL",
    template: "%s | GitHub Profile Explorer",
  },
  description:
    "Search and explore GitHub user profiles, repositories, and language statistics with interactive charts. Built with Next.js, React, GraphQL, Apollo Client, and Tailwind CSS. By Arnob Mahmud (contact@arnobmahmud.com).",
  keywords: [
    "GitHub",
    "Profile Explorer",
    "User Search",
    "GraphQL",
    "Apollo Client",
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "Data Visualization",
    "Recharts",
    "shadcn/ui",
    "GitHub API",
    "Repository Stats",
    "Programming Languages",
    "Arnob Mahmud",
  ],
  authors: [
    {
      name: "Arnob Mahmud",
      url: "https://www.arnobmahmud.com",
    },
  ],
  creator: "Arnob Mahmud",
  publisher: "Arnob Mahmud",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "GitHub Profile Explorer",
    title: "GitHub Profile Explorer | Search & Visualize GitHub Profiles with GraphQL",
    description:
      "Search and explore GitHub user profiles, repositories, and language statistics with interactive charts. Built with Next.js, React, GraphQL, and Apollo Client.",
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "GitHub Profile Explorer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Profile Explorer | Search & Visualize GitHub Profiles with GraphQL",
    description:
      "Search and explore GitHub user profiles, repositories, and language statistics with interactive charts. Built with Next.js, React, GraphQL, and Apollo Client.",
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "technology",
  applicationName: "GitHub Profile Explorer",
  referrer: "origin-when-cross-origin",
};

const themeScript = `
(function(){
  var k='github-explorer-theme';
  try{
    var t=localStorage.getItem(k);
    if(t==='dark'||t==='light'){document.documentElement.classList.add(t)}
    else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')}
    else{document.documentElement.classList.add('light')}
  }catch(e){document.documentElement.classList.add('light')}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased">
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
