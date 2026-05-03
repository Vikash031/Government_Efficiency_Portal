"use client";

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginDepartment } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await loginDepartment({ username, password });
            localStorage.setItem('department', JSON.stringify(res.data));
            router.push('/dashboard/admin');
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.response?.status === 401) {
                setError('Invalid username or password');
            } else if (error.response?.status >= 500) {
                setError('Server error. Please try again later.');
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden bg-grid-red">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-red-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-900/10 rounded-full blur-3xl"></div>
            </div>

            <Card className="w-full sm:max-w-[420px] mx-0 sm:mx-4 bg-zinc-950/40 border-0 sm:border border-white/5 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-10 rounded-none sm:rounded-[3rem] overflow-hidden transition-all duration-500">
                <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-900" />
                <CardHeader className="space-y-4 pb-8 pt-10">
                    <div className="flex justify-center mb-2">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.3)] group hover:scale-110 transition-transform duration-500">
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-3xl text-center font-black text-white uppercase tracking-tighter">
                            ADMINISTRATION
                        </CardTitle>
                        <p className="text-[10px] text-center text-red-500 font-black uppercase tracking-[0.4em] ml-1">Official Personnel Only</p>
                    </div>
                </CardHeader>
                <CardContent className="px-10 pb-10">
                    {error && (
                        <div className="bg-red-950/30 border border-red-600/50 text-red-500 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-3 mb-6">
                            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{error}</span>
                        </div>
                    )}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Username</label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="admin_dept"
                                value={username}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                required
                                autoCapitalize="none"
                                className="h-14 bg-black/40 border-red-900/30 text-white placeholder:text-zinc-800 rounded-xl focus:ring-red-600 focus:border-red-600 transition-all font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    required
                                    className="h-14 bg-black/40 border-red-900/30 text-white placeholder:text-zinc-800 rounded-xl focus:ring-red-600 focus:border-red-600 pr-14 transition-all font-bold"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-red-500 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-[0_10px_30px_rgba(239,68,68,0.3)] disabled:opacity-50 transition-all active:scale-[0.98]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    LOGGING IN...
                                </span>
                            ) : (
                                'LOGIN'
                            )}
                        </Button>

                        <div className="mt-6 text-center">
                            <Link href="/login" className="text-[10px] font-black text-zinc-200 hover:text-red-500 uppercase tracking-widest transition-colors inline-flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                BACK TO SERVICES
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
