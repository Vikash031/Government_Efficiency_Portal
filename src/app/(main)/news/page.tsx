"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSchemes, getNews } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function News() {
    const [schemes, setSchemes] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('news'); // 'news', 'programs'

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [schemesData, newsData] = await Promise.all([
                getSchemes(),
                getNews()
            ]);
            setSchemes(schemesData);
            setNews(newsData);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setError('Failed to load news feed.');
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-black text-red-600 uppercase tracking-widest">Loading News Feed...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen dashboard-container pb-24 md:pb-8">
            {/* Top Bar */}
            <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-xl border-b border-red-900/20 px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] text-red-glow">Information Hub</h2>
                    <p className="text-lg md:text-xl font-black text-white uppercase">{activeTab === 'news' ? 'Latest Broadcasts' : 'Public Programs'}</p>
                </div>
                <div className="flex gap-1 p-1 bg-zinc-950 border border-red-900/10 rounded-2xl w-full md:w-fit overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('news')}
                        className={cn(
                            "px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                            activeTab === 'news' ? "bg-red-600 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-200"
                        )}
                    >
                        Official News
                    </button>
                    <button
                        onClick={() => setActiveTab('programs')}
                        className={cn(
                            "px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                            activeTab === 'programs' ? "bg-red-600 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-200"
                        )}
                    >
                        Programs
                    </button>
                </div>
            </div>

            <div className="p-8 max-w-5xl mx-auto space-y-8 bg-grid-red">
                {/* Featured Headline */}
                <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-black border border-red-900/30 text-white p-6 md:p-12 shadow-2xl group">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-600/10 to-transparent blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
                    <div className="relative z-10 space-y-4 md:space-y-6">
                        <Badge className="bg-red-600 text-white border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest red-glow">Breaking News</Badge>
                        <h1 className="text-2xl md:text-5xl font-black tracking-tight leading-[1.1] max-w-2xl text-white uppercase">Digital Services Initiative 2026</h1>
                        <p className="text-zinc-400 font-bold max-w-xl leading-relaxed text-sm md:text-base italic">The government has launched a major update to the digital services infrastructure to provide better access across the nation.</p>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 pt-4">
                            <Button className="bg-red-600 text-white hover:bg-red-700 rounded-2xl px-8 h-14 w-full md:w-auto font-black text-xs uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(255,0,0,0.2)]">Read Full Article</Button>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Released: 10:30 AM IST</p>
                        </div>
                    </div>
                </div>

                {/* News Grid */}
                <div className="grid gap-6">
                    {activeTab === 'news' ? (
                        news.length === 0 ? (
                            <div className="text-center py-24 bg-zinc-950/50 rounded-[2.5rem] border border-red-900/10">
                                <p className="text-zinc-500 font-black text-xs uppercase tracking-widest">No official news broadcasts available at this time.</p>
                            </div>
                        ) : (
                            news.map((item: any, i) => (
                                <Card key={item._id} className="border border-red-900/20 bg-zinc-950/50 backdrop-blur-md shadow-2xl shadow-black overflow-hidden rounded-[2.5rem] group hover:border-red-500/30 transition-all duration-500 animate-in" style={{ animationDelay: `${i * 100}ms` }}>
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row">
                                            <div className="w-full md:w-1/3 bg-black relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 to-black flex items-center justify-center">
                                                    <Newspaper className="h-16 w-16 text-red-900/20 group-hover:scale-110 group-hover:text-red-600/30 transition-all duration-700" />
                                                </div>
                                            </div>
                                            <div className="p-8 flex-1 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <Badge variant="outline" className="text-red-500 border-red-900/30 bg-red-950/20 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">{item.category || 'News'}</Badge>
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-red-500 transition-colors uppercase">{item.title}</h3>
                                                <p className="text-sm font-bold text-zinc-300 leading-relaxed italic line-clamp-3">"{item.content}"</p>
                                                <div className="pt-4 flex items-center gap-2">
                                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Source: {item.departmentId?.name || "Official Portal"}</p>
                                                    <div className="h-1 w-1 rounded-full bg-red-900/30" />
                                                    <Button variant="link" className="text-red-500 font-black text-[10px] uppercase tracking-widest p-0 h-auto hover:text-red-400 transition-colors">Verify Details</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )
                    ) : (
                        schemes.length === 0 ? (
                            <div className="text-center py-24 bg-zinc-950/50 rounded-[2.5rem] border border-red-900/10">
                                <p className="text-zinc-500 font-black text-xs uppercase tracking-widest">No active programs available at this time.</p>
                            </div>
                        ) : (
                            schemes.map((item: any, i) => (
                                <Card key={item._id} className="border border-red-900/20 bg-zinc-950/50 backdrop-blur-md shadow-2xl shadow-black overflow-hidden rounded-[2.5rem] group hover:border-red-500/30 transition-all duration-500 animate-in" style={{ animationDelay: `${i * 100}ms` }}>
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row">
                                            <div className="w-full md:w-1/3 bg-black relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 to-black flex items-center justify-center">
                                                    <Briefcase className="h-16 w-16 text-red-900/20 group-hover:scale-110 group-hover:text-red-600/30 transition-all duration-700" />
                                                </div>
                                            </div>
                                            <div className="p-8 flex-1 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <Badge variant="outline" className="text-red-500 border-red-900/30 bg-red-950/20 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">Welfare Program</Badge>
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-red-500 transition-colors uppercase">{item.title}</h3>
                                                <p className="text-sm font-bold text-zinc-300 leading-relaxed line-clamp-2">{item.description}</p>
                                                <div className="pt-4 flex items-center gap-2">
                                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Department: {item.departmentId?.name || "Governance"}</p>
                                                    <div className="h-1 w-1 rounded-full bg-red-900/30" />
                                                    <Button className="bg-red-600 hover:bg-red-700 h-8 px-6 text-[8px] font-black uppercase tracking-widest rounded-lg">Apply Now</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
