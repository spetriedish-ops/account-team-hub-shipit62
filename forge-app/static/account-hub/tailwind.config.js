/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        background: "hsl(210 16% 97%)",
        foreground: "hsl(216 33% 17%)",
        card: "hsl(0 0% 100%)",
        "card-foreground": "hsl(216 33% 17%)",
        primary: "hsl(214 82% 40%)",
        "primary-foreground": "hsl(0 0% 100%)",
        secondary: "hsl(220 14% 95%)",
        "secondary-foreground": "hsl(215 25% 35%)",
        muted: "hsl(220 14% 95%)",
        "muted-foreground": "hsl(215 16% 47%)",
        accent: "hsl(220 14% 93%)",
        "accent-foreground": "hsl(216 33% 17%)",
        destructive: "hsl(14 88% 45%)",
        "destructive-foreground": "hsl(0 0% 100%)",
        border: "hsl(220 13% 89%)",
        input: "hsl(220 13% 89%)",
        ring: "hsl(214 82% 40%)",
        hub: {
          success: "hsl(152 55% 42%)",
          warning: "hsl(38 100% 50%)",
          info: "hsl(214 82% 40%)",
        },
      },
      borderRadius: {
        lg: "0.375rem",
        md: "0.25rem",
        sm: "0.125rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
