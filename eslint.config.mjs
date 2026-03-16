import nextPlugin from "eslint-config-next/core-web-vitals";

const config = [
  ...nextPlugin,
  {
    ignores: [".next/**", "out/**", "build/**", "dist/**", "next-env.d.ts", "node_modules/**"],
  },
];

export default config;
