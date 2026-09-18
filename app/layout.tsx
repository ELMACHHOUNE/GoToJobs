import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CommandMenu } from "@/components/command-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { StoreProvider } from "@/lib/store/store-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GoToJobs — Find jobs that fit your skills",
    template: "%s | GoToJobs",
  },
  description: "Discover relevant opportunities, understand why they match your profile, and keep your applications organized.",
  keywords: ["jobs", "career", "developer", "software engineer", "remote", "matching"],
  authors: [{ name: "GoToJobs" }],
  creator: "GoToJobs",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gotojobs.app",
    siteName: "GoToJobs",
    title: "GoToJobs — Find jobs that fit your skills",
    description: "Discover relevant opportunities, understand why they match your profile, and keep your applications organized.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoToJobs — Find jobs that fit your skills",
    description: "Discover relevant opportunities, understand why they match your profile, and keep your applications organized.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <StoreProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CommandMenu />
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: "bg-background border",
                style: { background: "var(--background)", color: "var(--foreground)" },
              }}
            />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}