import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import {
    Timer, BookOpen, Brain, Target, Zap, TrendingUp,
    ArrowRight, CheckCircle2, Sparkles, Clock, Award,
} from 'lucide-react';

const features = [
    {
        icon: Timer,
        color: "text-blue-400",
        bg: "bg-blue-500/10 border-blue-500/20",
        title: "Pomodoro Timer",
        desc: "Stay laser-focused with timed work sessions and built-in breaks. Three beautiful timer designs to match your style.",
    },
    {
        icon: BookOpen,
        color: "text-purple-400",
        bg: "bg-purple-500/10 border-purple-500/20",
        title: "Spaced Repetition",
        desc: "Build flashcard decks and let the SM-2 algorithm automatically schedule your reviews for maximum long-term retention.",
    },
    {
        icon: Brain,
        color: "text-pink-400",
        bg: "bg-pink-500/10 border-pink-500/20",
        title: "AI-Generated Tests",
        desc: "Generate quizzes on any topic or paste your notes and get a personalised test in seconds. Track scores over time.",
    },
    {
        icon: Target,
        color: "text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/20",
        title: "Goals & Milestones",
        desc: "Turn big ambitions into actionable milestones. Templates for career, health, finance, languages and more.",
    },
    {
        icon: Zap,
        color: "text-primary-400",
        bg: "bg-primary-500/10 border-primary-500/20",
        title: "Daily Habits",
        desc: "AI builds personalised habits straight from your goals. Build streaks, stay consistent, and see results.",
    },
    {
        icon: TrendingUp,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10 border-cyan-500/20",
        title: "Progress Analytics",
        desc: "Visualise study time, test scores, habit streaks and weekly activity — all in one clean dashboard.",
    },
];

const steps = [
    {
        number: "01",
        title: "Set your goals",
        desc: "Pick from curated goal templates or build your own. Define milestones and target dates to stay on track.",
    },
    {
        number: "02",
        title: "Get a study plan",
        desc: "AI generates a personalised learning plan with daily tasks sized to fit your schedule and pace.",
    },
    {
        number: "03",
        title: "Track & level up",
        desc: "Use Pomodoro, flashcards and AI tests every day. Watch your streaks, scores and knowledge compound.",
    },
];

export default function Landing() {
    return (
        <div className="min-h-screen bg-[#0C0E12] text-slate-100">

            {/* ── Navbar ───────────────────────────────────────────── */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0C0E12]/80 backdrop-blur-md border-b border-slate-800/50">
                <span className="text-xl font-bold text-white tracking-tight select-none">
                    ONYX <span className="text-primary-500">Study</span>
                </span>
                <div className="flex items-center gap-2">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-[10px] transition-colors">
                                Log in
                            </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 rounded-[10px] transition-colors">
                                Sign Up
                            </button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <Link to="/dashboard">
                            <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 rounded-[10px] transition-colors inline-flex items-center gap-1.5">
                                Dashboard <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </Link>
                    </SignedIn>
                </div>
            </nav>

            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="pt-44 pb-28 px-6 text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-950/60 border border-primary-800/40 text-primary-400 text-xs font-medium mb-8">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI-powered learning, built for serious students
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6">
                    Learn smarter,<br />
                    <span className="text-primary-400">not harder</span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    ONYX Study combines AI-driven study plans, spaced repetition, Pomodoro timers, and
                    habit tracking into one platform. Stop winging it — start learning with structure.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <SignedOut>
                        <SignUpButton mode="modal">
                            <button className="w-full sm:w-auto px-7 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-[10px] transition-colors inline-flex items-center justify-center gap-2 text-base">
                                Start for free <ArrowRight className="w-4 h-4" />
                            </button>
                        </SignUpButton>
                        <SignInButton mode="modal">
                            <button className="w-full sm:w-auto px-7 py-3.5 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-[10px] transition-colors text-base">
                                Log in
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <Link to="/dashboard" className="w-full sm:w-auto">
                            <button className="w-full px-7 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-[10px] transition-colors inline-flex items-center justify-center gap-2 text-base">
                                Go to Dashboard <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </SignedIn>
                </div>
                <p className="mt-5 text-sm text-slate-500">Free to use. No credit card required.</p>
            </section>

            {/* ── Stats bar ────────────────────────────────────────── */}
            <section className="py-12 border-y border-slate-800/60 bg-slate-900/30">
                <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center px-6">
                    {[
                        { icon: Clock, value: "10+", label: "Study tools" },
                        { icon: Brain, value: "4", label: "AI features" },
                        { icon: Award, value: "100%", label: "Free to start" },
                    ].map(({ icon: Icon, value, label }) => (
                        <div key={label} className="flex flex-col items-center gap-1">
                            <div className="text-3xl font-bold text-primary-400">{value}</div>
                            <div className="flex items-center gap-1.5 text-sm text-slate-400">
                                <Icon className="w-3.5 h-3.5" /> {label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features grid ────────────────────────────────────── */}
            <section className="py-24 px-6 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Everything you need to study effectively
                    </h2>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        A complete toolkit built around science-backed learning methods.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map(({ icon: Icon, color, bg, title, desc }) => (
                        <div
                            key={title}
                            className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-colors"
                        >
                            <div className={`inline-flex p-2.5 rounded-lg border ${bg} mb-4`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How it works ─────────────────────────────────────── */}
            <section className="py-24 px-6 bg-slate-900/30 border-y border-slate-800/60">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How it works</h2>
                        <p className="text-slate-400 text-lg">Up and running in minutes.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {steps.map(({ number, title, desc }) => (
                            <div key={number} className="text-center">
                                <div className="text-6xl font-black text-slate-800 mb-4 leading-none select-none">
                                    {number}
                                </div>
                                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ────────────────────────────────────────── */}
            <section className="py-28 px-6 text-center max-w-3xl mx-auto">
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
                    Ready to level up<br />your learning?
                </h2>
                <SignedOut>
                    <SignUpButton mode="modal">
                        <button className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-[10px] transition-colors text-base inline-flex items-center gap-2">
                            Create your free account <ArrowRight className="w-4 h-4" />
                        </button>
                    </SignUpButton>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
                        {["No credit card", "Free forever", "Start in 60 seconds"].map(item => (
                            <span key={item} className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary-600" />
                                {item}
                            </span>
                        ))}
                    </div>
                </SignedOut>
                <SignedIn>
                    <Link to="/dashboard">
                        <button className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-[10px] transition-colors text-base inline-flex items-center gap-2">
                            Go to Dashboard <ArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                </SignedIn>
            </section>

            {/* ── Footer ───────────────────────────────────────────── */}
            <footer className="border-t border-slate-800/60 py-8 px-6 text-center text-sm text-slate-500">
                © 2026 ONYX Study. All rights reserved.
            </footer>
        </div>
    );
}
