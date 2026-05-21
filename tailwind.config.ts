import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gmi: {
          blue: "#0B5A93",
          blueDark: "#073F68",
          orange: "#F58220",
          danger: "#DC2626",
        },
      },
      boxShadow: {
        card: "0 14px 35px rgba(11, 90, 147, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
