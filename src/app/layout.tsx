import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-neutral-50 dark:bg-[#0b0912] text-neutral-900 dark:text-neutral-100" suppressHydrationWarning>
        <AuthProvider>
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
