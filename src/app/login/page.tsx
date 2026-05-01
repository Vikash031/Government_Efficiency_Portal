"use client";

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginUser } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await loginUser({ email, password });
            localStorage.setItem('user', JSON.stringify(res.data));
            router.push('/dashboard/user');
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Invalid credentials. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden">
            {/* National Command Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
            
            {/* Strategic Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px] pointer-events-none"></div>

            <Card className="w-full max-w-[450px] mx-4 bg-zinc-950/50 border border-red-900/20 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 rounded-[2.5rem] overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-900" />
                
                <CardHeader className="space-y-4 pb-8 pt-10">
                    <div className="flex justify-center mb-2">
                        <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                            </svg>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-3xl text-center font-black text-white uppercase tracking-tighter">
                            SIGN IN
                        </CardTitle>
                        <p className="text-[10px] text-center text-red-500 font-black uppercase tracking-[0.4em] ml-1">Access Account</p>
                    </div>
                </CardHeader>

                <CardContent className="px-6 md:px-10 pb-10">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-950/30 border border-red-600/50 text-red-500 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-3 animate-shake">
                                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="YOUR@EMAIL.COM"
                                value={email}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="h-14 bg-black/40 border-red-900/30 text-white placeholder:text-zinc-600 rounded-xl focus:ring-red-600 focus:border-red-600 transition-all font-bold"
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
                                    disabled={loading}
                                    className="h-14 bg-black/40 border-red-900/30 text-white placeholder:text-zinc-600 rounded-xl focus:ring-red-600 focus:border-red-600 pr-14 transition-all font-bold"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 transition-colors"
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
                            disabled={loading}
                            className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-[0_10px_30px_rgba(239,68,68,0.3)] disabled:opacity-50 transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    AUTHENTICATING...
                                </span>
                            ) : (
                                'SIGN IN'
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col items-center gap-4 bg-red-950/10 py-8 border-t border-red-900/10">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        New User? <Link href="/signup" className="text-red-500 hover:text-red-400 transition-colors">Create account</Link>
                    </p>
                    <div className="flex flex-col gap-2 w-full px-6 md:px-10">
                        <Link href="/employee/login" className="text-[9px] text-center text-zinc-400 hover:text-red-500 font-black uppercase tracking-widest transition-all py-2 border border-red-900/10 rounded-lg hover:border-red-900/30">
                            EMPLOYEE LOGIN →
                        </Link>
                        <Link href="/admin/login" className="text-[9px] text-center text-zinc-400 hover:text-red-500 font-black uppercase tracking-widest transition-all py-2 border border-red-900/10 rounded-lg hover:border-red-900/30">
                            ADMINISTRATOR LOGIN →
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
