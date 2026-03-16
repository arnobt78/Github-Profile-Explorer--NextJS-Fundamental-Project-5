"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Database, Layers, Palette, Zap, GitBranch } from "lucide-react";
import { SearchForm } from "@/components/form/SearchForm";
import { UserProfile } from "@/components/user/UserProfile";
import { useSearchContext } from "@/context/SearchContext";
import { EducationalCard } from "@/components/ui/EducationalCard";
import { StreamingText } from "@/components/ui/StreamingText";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const learnItems = [
  {
    title: "React Fundamentals",
    description:
      "Components, hooks, and state management. Build reusable UI with the React library.",
    icon: <Code2 className="h-5 w-5" />,
  },
  {
    title: "GraphQL & Apollo",
    description:
      "Query data with GraphQL and manage it with Apollo Client. Declarative data fetching.",
    icon: <Database className="h-5 w-5" />,
  },
  {
    title: "Next.js App Router",
    description:
      "Server and client components. Understand SSR vs CSR for better performance.",
    icon: <Layers className="h-5 w-5" />,
  },
  {
    title: "Tailwind CSS",
    description:
      "Utility-first styling. Rapid UI development with responsive design utilities.",
    icon: <Palette className="h-5 w-5" />,
  },
  {
    title: "Modern Tooling",
    description:
      "TypeScript, ESLint, and Framer Motion. Production-ready developer experience.",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    title: "Git & Version Control",
    description:
      "Understand Git workflows, branching, and collaboration with GitHub.",
    icon: <GitBranch className="h-5 w-5" />,
  },
];

export function ExplorerPage() {
  const { userName, setUserName } = useSearchContext();

  return (
    <main className="relative min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 z-0 animate-grid-move bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-9xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <motion.section
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex flex-col items-center justify-center text-center"
        >
          <motion.h1
            variants={fadeIn}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-4 flex justify-center text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl"
          >
            <span className="shrink-0 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
              Let&apos;s
            </span>
            <span className="inline-block min-w-[8ch] pl-[0.25em] text-left align-baseline">
              <StreamingText />
            </span>
          </motion.h1>
          <motion.p
            variants={fadeIn}
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="mb-8 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl"
          >
            Search and visualize GitHub profiles, repositories, and language stats
            with interactive charts. A beginner-friendly project to learn React,
            GraphQL, and modern web development.
          </motion.p>
        </motion.section>

        <section className="mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-4 text-center font-mono text-xl font-bold sm:text-2xl md:text-3xl"
          >
            What you&apos;ll learn
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {learnItems.map((item, i) => (
              <EducationalCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
                delay={i * 0.08}
              />
            ))}
          </div>
        </section>

        <section className="mb-8 flex flex-col items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{
              duration: 0.5,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="w-full max-w-xl"
          >
            <SearchForm userName={userName} setUserName={setUserName} />
          </motion.div>
        </section>

        <section>
          <UserProfile userName={userName} />
        </section>
      </div>
    </main>
  );
}
