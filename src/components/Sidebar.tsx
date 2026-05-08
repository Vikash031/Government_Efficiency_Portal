
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Settings, User, Newspaper, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function Sidebar({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [dashboardLink, setDashboardLink] = useState('/dashboard/user'); // Default to user
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const department = localStorage.getItem('department');
        const employee = localStorage.getItem('employee');
        if (department) setDashboardLink('/dashboard/admin');
        else if (employee) setDashboardLink('/dashboard/employee');
        else setDashboardLink('/dashboard/user');
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('department');
        localStorage.removeItem('employee');
        router.push('/login');
    };

    const sidebarItems = [
        { name: 'Dashboard', path: dashboardLink, icon: LayoutDashboard },
        { name: 'News & Schemes', path: '/news', icon: Newspaper }, // Connected New Link
        { name: 'Profile', path: '/profile', icon: User },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    if (!mounted) {
        return <div className="min-h-screen bg-background">Loading...</div>; // Avoid hydration mismatch
    }

    return (
        <div className="flex h-screen w-full bg-black overflow-hidden relative">
            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-900/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/5 blur-[120px] pointer-events-none" />

            <aside className="hidden w-80 flex-col bg-black border-r border-red-900/20 md:flex shadow-[20px_0_40px_rgba(0,0,0,0.8)] z-10">
                <div className="flex flex-col h-28 justify-center px-10">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="p-3 bg-red-600 rounded-2xl shadow-2xl shadow-red-900/50 group-hover:scale-110 transition-transform duration-500 red-glow">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black tracking-[0.25em] text-white uppercase leading-none">GEP Portal</h1>
                            <p className="text-[10px] text-red-500 font-black mt-1.5 tracking-widest uppercase text-red-glow">Government Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-2 p-6">
                    <div className="text-[10px] font-black text-red-900 uppercase tracking-[0.3em] mb-6 px-4">Menu</div>
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={cn(
                                    "flex items-center gap-4 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest transition-all duration-500 group relative overflow-hidden",
                                    isActive
                                        ? "bg-red-600 text-white shadow-2xl shadow-red-900/40"
                                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <Icon className={cn("h-5 w-5 transition-all duration-500", isActive ? "text-white" : "text-zinc-800 group-hover:text-red-500 group-hover:scale-110")} />
                                {item.name}
                                {isActive && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/20 rounded-l-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-8 mt-auto">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start text-zinc-200 hover:text-white hover:bg-red-600 rounded-2xl h-14 px-6 gap-4 font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </Button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto relative z-0 pb-20 md:pb-0">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-2xl border-t border-red-900/20 px-6 flex items-center justify-between z-50">
                {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-all duration-300",
                                isActive ? "text-red-500 scale-110" : "text-zinc-300 hover:text-white"
                            )}
                        >
                            <Icon className={cn("h-6 w-6", isActive && "red-glow")} />
                            <span className="text-[8px] font-black uppercase tracking-tighter">{item.name}</span>
                            {isActive && (
                                <div className="absolute -top-1 w-8 h-1 bg-red-600 rounded-full red-glow shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            )}
                        </Link>
                    );
                })}
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center gap-1 text-zinc-300 hover:text-red-500"
                >
                    <LogOut className="h-6 w-6" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Exit</span>
                </button>
            </nav>
        </div>
    );
}
