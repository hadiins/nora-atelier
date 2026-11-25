import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF9F6",
        sand: "#F2EFE9",
        charcoal: "#121212",
        obsidian: "#0A0A0A",
        muted: "#6E6A63",
        gold: "#A6824C",
        goldLight: "#D4B788",
      },
    },
  },
  plugins: [],
};
export default config;
