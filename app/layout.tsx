import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "./components/Navbar";
import { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GymTracker - Smart Workout Progress Tracking",
  description: "Track your workouts, monitor progress, and achieve your fitness goals with our intelligent gym tracking system.",
  keywords: ["gym tracker", "workout logger", "fitness progress", "exercise tracking"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans h-full bg-slate-950`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 flex">
              <main className="flex-1 bg-slate-950">
                <div className="mx-auto max-w-7xl p-6">
                  <div className="backdrop-blur-xl bg-slate-900/50 rounded-2xl shadow-xl border border-slate-800/50 p-6">
                    {children}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
