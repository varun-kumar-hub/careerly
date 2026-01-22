import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Briefcase, FileText, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navbar */}
      <header className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Briefcase className="h-6 w-6" />
          <span>Careerly</span>
        </div>
        <div className="ml-auto flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Sign up</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="py-24 px-6 text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground">
            Career Intelligence for <span className="text-primary">Developers</span>.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stop applying blindly. Get intelligent matches based on your skills, analyze your resume against real job descriptions, and track your career growth.
          </p>
          <div className="flex items-center justify-center gap-4 pt-6">
            <Button size="lg" className="h-12 px-8 text-lg" asChild>
              <Link href="/dashboard">Get Started &rarr;</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-card border shadow-sm">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Resume Intelligence</h3>
              <p className="text-muted-foreground">Upload your resume and get instant analysis on structure, missing sections, and skill gaps.</p>
            </div>

            <div className="p-8 rounded-2xl bg-card border shadow-sm">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Job Matching</h3>
              <p className="text-muted-foreground">We aggregate jobs from Adzuna, Remotive, and Jooble and score them against your specific technical stack.</p>
            </div>

            <div className="p-8 rounded-2xl bg-card border shadow-sm">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Focused Dashboard</h3>
              <p className="text-muted-foreground">A clean, distraction-free environment to track your applications and profile growth.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Careerly. All rights reserved.
      </footer>
    </div>
  );
}
