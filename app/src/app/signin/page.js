"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Github } from "lucide-react";
import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeSwitch from "../(main)/components/ThemeSwitch";

function SignInContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const registered = searchParams.get("registered");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push(callbackUrl);
            }
        } catch (error) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            {/* Dark Mode Toggle - Top Right */}
            <div className="absolute top-6 right-6">
                <ThemeSwitch />
            </div>
            
            <div className="w-full max-w-md p-8">
                <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-muted-foreground">
                            Sign in to analyze your résumé
                        </p>
                    </div>

                    {registered && (
                        <div className="mb-6 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-800 p-4">
                            <p className="text-sm text-green-800 dark:text-green-400">
                                Account created successfully! Please sign in.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 p-4">
                            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-border placeholder-muted-foreground text-foreground bg-background rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-border placeholder-muted-foreground text-foreground bg-background rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Password"
                            />
                        </div>

                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary hover:text-primary/80 text-primary">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-background text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => signIn("google", { callbackUrl })}
                            className="w-full flex items-center justify-center gap-3 bg-card hover:bg-muted text-foreground border border-border font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        <button
                            onClick={() => signIn("github", { callbackUrl })}
                            className="w-full flex items-center justify-center gap-3 bg-foreground hover:bg-foreground/90 text-background font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            <Github className="w-5 h-5" />
                            Continue with GitHub
                        </button>

                        {process.env.NODE_ENV === "development" && (
                            <button
                                onClick={() => signIn("developer", { callbackUrl })}
                                className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mt-4 border border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                Bypass Login (Developer Mode)
                            </button>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="font-medium text-primary text-primary hover:text-primary/80"
                            >
                                Create one here
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 text-center text-xs text-muted-foreground">
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SignIn() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        }>
            <SignInContent />
        </Suspense>
    );
}
