import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        node: {
          start: {
            DEFAULT: "hsl(var(--node-start))",
            bg: "hsl(var(--node-start-bg))",
            border: "hsl(var(--node-start-border))",
          },
          task: {
            DEFAULT: "hsl(var(--node-task))",
            bg: "hsl(var(--node-task-bg))",
            border: "hsl(var(--node-task-border))",
          },
          approval: {
            DEFAULT: "hsl(var(--node-approval))",
            bg: "hsl(var(--node-approval-bg))",
            border: "hsl(var(--node-approval-border))",
          },
          automated: {
            DEFAULT: "hsl(var(--node-automated))",
            bg: "hsl(var(--node-automated-bg))",
            border: "hsl(var(--node-automated-border))",
          },
          end: {
            DEFAULT: "hsl(var(--node-end))",
            bg: "hsl(var(--node-end-bg))",
            border: "hsl(var(--node-end-border))",
          },
        },
        status: {
          success: "hsl(var(--status-success))",
          warning: "hsl(var(--status-warning))",
          error: "hsl(var(--status-error))",
          info: "hsl(var(--status-info))",
        },
        sim: {
          active: "hsl(var(--sim-active))",
          pending: "hsl(var(--sim-pending))",
          error: "hsl(var(--sim-error))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px hsl(var(--sim-active) / 0.5)" },
          "50%": { boxShadow: "0 0 20px hsl(var(--sim-active) / 0.8)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(10px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 1.5s ease-in-out infinite",
        "slide-in": "slide-in 0.2s ease-out",
      },
      boxShadow: {
        node: "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
        "node-hover": "0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)",
        "node-active": "0 0 0 3px hsl(var(--primary) / 0.2)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
