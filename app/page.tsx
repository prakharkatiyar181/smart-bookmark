import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Bookmark, Rocket, Sparkles, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-2 items-center font-bold text-lg">
              <Link href={"/"} className="flex items-center gap-2">
                <Bookmark className="h-6 w-6 text-primary" />
                <span>Smart Bookmark</span>
              </Link>
            </div>
            {hasEnvVars && (
              <Suspense>
                <div className="flex items-center gap-4">
                  <ThemeSwitcher />
                  <AuthButton />
                </div>
              </Suspense>
            )}
          </div>
        </nav>

        <div className="flex-1 flex flex-col gap-16 w-full items-center">
          <section className="w-full py-20 md:py-32 bg-gradient-to-b from-background to-muted/50 px-4">
            <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                Manage your bookmarks <span className="text-primary">intelligently</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px]">
                A simple, powerful, and real-time bookmark manager. Save your favorite links and access them from anywhere.
              </p>
              <div className="flex gap-4 mt-8">
                <Link href="/protected">
                  <Button size="lg" className="gap-2">
                    Get Started <Rocket className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section className="w-full max-w-5xl px-4 grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
            <div className="flex flex-col items-center text-center gap-2 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-3 rounded-full bg-primary/10 mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Real-time Sync</h3>
              <p className="text-muted-foreground">
                Your bookmarks sync instantly across all your open tabs and devices.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-3 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">AI Powered</h3>
              <p className="text-muted-foreground">
                Automatically categorizes and tags your bookmarks for easy retrieval.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-3 rounded-full bg-primary/10 mb-4">
                <Bookmark className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Google Auth</h3>
              <p className="text-muted-foreground">
                Secure and quick login using your Google account. No new passwords to remember.
              </p>
            </div>
          </section>
        </div>

        <footer className="w-full border-t py-8 px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 Smart Bookmark App. All rights reserved.</p>
            <p className="flex items-center gap-2">
              Built with Next.js and Supabase
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
