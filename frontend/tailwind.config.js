/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#112C3D",
        lagoon: "#0D5C63",
        tide: "#2FA3A0",
        sand: "#F6EDE3",
        coral: "#FF7A59",
        cloud: "#F9FBFC",
        mist: "#D8E4EA",
        slate: "#45606F"
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Segoe UI", "sans-serif"],
        display: ['"Fraunces"', "Georgia", "serif"]
      },
      boxShadow: {
        ambient: "0 30px 60px rgba(17, 44, 61, 0.12)",
        card: "0 14px 30px rgba(17, 44, 61, 0.08)"
      },
      backgroundImage: {
        glow:
          "radial-gradient(circle at top left, rgba(47,163,160,0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(255,122,89,0.16), transparent 35%)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        },
        rise: {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        }
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        rise: "rise 0.45s ease-out"
      }
    }
  },
  plugins: []
};

