import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk, Caveat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";

// Space Grotesk is the display/body face across the whole app — the bold,
// rounded-terminal geometric sans the marketing site uses for headings, and
// its regular/medium weights double as body copy so the app never mixes in
// a second unrelated sans. Caveat is the "handwritten highlighter" accent
// used only for the odd emphasized phrase inside a headline (never body
// copy) — see landing/*.tsx's <Script> usages.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-script",
  weight: ["600", "700"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yeshara — Primary Market",
  description: "Tokenized real-world asset offerings, settled on Stellar.",
};

// Sets the `dark` class on <html> before first paint, so the page never
// flashes the wrong theme while React hydrates. Kept in sync with
// useTheme's readInitialTheme() — same precedence (stored choice, then
// system preference).
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("yeshara_theme");
    var dark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${caveat.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col font-display bg-neutral-50 dark:bg-ink text-neutral-900 dark:text-ink-fg" suppressHydrationWarning>
        <AuthProvider>
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
