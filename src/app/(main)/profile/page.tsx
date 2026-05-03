"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User as UserIcon, Mail, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Profile() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const department = JSON.parse(localStorage.getItem('department') || '{}');
        const employee = JSON.parse(localStorage.getItem('employee') || '{}');

        // Determine which profile to show
        const profileData = user._id ? { ...user, type: 'Citizen' } :
            (department._id ? { ...department, type: 'Department Admin', email: department.username } :
                (employee._id ? { ...employee, type: 'Official / Employee', role: employee.role } : null));

        setProfile(profileData);
        setLoading(false);
    }, []);

    if (loading) return null;

    if (!profile) {
        return <div className="p-6">Please log in to view profile.</div>;
    }

    return (
        <div className="min-h-screen dashboard-container">
            {/* Top Bar */}
            <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-xl border-b border-red-900/20 px-8 py-4 flex justify-between items-center">
                <div>
                    <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] text-red-glow">Profile Info</h2>
                    <p className="text-xl font-black text-white">Account Details</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                        {profile.name.charAt(0)}
                    </div>
                </div>
            </div>

            <div className="p-8 max-w-4xl mx-auto space-y-8 bg-grid-red">
                {/* Profile Hero Card */}
                <Card className="overflow-hidden border border-red-900/20 bg-zinc-950/50 backdrop-blur-md shadow-2xl shadow-black group">
                    <div className="h-32 bg-black relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-transparent to-red-900/20" />
                        <div className="absolute inset-0 bg-grid-red opacity-10" />
                    </div>
                    <CardContent className="relative pt-0 px-8 pb-10">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-8">
                            <div className="h-32 w-32 rounded-[2.5rem] bg-black p-2 shadow-2xl relative z-10 border border-red-900/20">
                                <div className="h-full w-full rounded-[2rem] bg-red-600 flex items-center justify-center text-white font-black text-4xl shadow-[0_0_30px_rgba(239,68,68,0.3)] red-glow">
                                    {profile.name.charAt(0)}
                                </div>
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-2">{profile.type}</p>
                                <h3 className="text-4xl font-black text-white tracking-tight leading-none mb-2">{profile.name}</h3>
                                <p className="text-sm font-bold text-zinc-300">Verified Account • Official Access</p>
                            </div>
                            <div className="flex gap-2">
                                <Badge className="bg-emerald-950/30 text-emerald-500 border border-emerald-900/30 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">Verified</Badge>
                                <Badge className="bg-red-950/30 text-red-500 border border-red-900/30 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">Active</Badge>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mt-12">
                            <div className="p-6 rounded-3xl bg-black/40 border border-red-900/10 flex items-center gap-5 group hover:border-red-500/30 hover:bg-black/60 transition-all duration-500 shadow-inner">
                                <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-red-900/20 shadow-sm flex items-center justify-center text-red-500/50 group-hover:text-red-500 group-hover:scale-110 transition-all duration-500">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Email Address</p>
                                    <p className="text-sm font-black text-zinc-200">{profile.email || profile.username}</p>
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-black/40 border border-red-900/10 flex items-center gap-5 group hover:border-red-500/30 hover:bg-black/60 transition-all duration-500 shadow-inner">
                                <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-red-900/20 shadow-sm flex items-center justify-center text-red-500/50 group-hover:text-red-500 group-hover:scale-110 transition-all duration-500">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Account Role</p>
                                    <p className="text-sm font-black text-zinc-200 capitalize">{profile.role || 'Standard Citizen'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-center">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    localStorage.removeItem('user');
                                    localStorage.removeItem('department');
                                    localStorage.removeItem('employee');
                                    router.push('/login');
                                }}
                                className="px-12 py-7 rounded-3xl border-red-900/30 text-red-500 hover:text-white hover:bg-red-600 hover:border-red-600 font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 shadow-[0_0_20px_rgba(255,0,0,0.1)]"
                            >
                                Log Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
