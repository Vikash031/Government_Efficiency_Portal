
"use client";

import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import MessageCard from '@/components/MessageCard';
import JusticePortal from '@/components/JusticePortal';
import { getUserGrievances, getDepartments, createGrievance, reopenGrievance, getPublicEmployees } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { 
    Activity, 
    CheckCircle, 
    Clock, 
    Send, 
    History, 
    User as UserIcon, 
    Building2, 
    ShieldCheck, 
    ArrowRight,
    MessageSquare,
    AlertCircle,
    BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardDescription, CardFooter } from '@/components/ui/card';

export default function UserDashboard() {
    const [grievances, setGrievances] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [user, setUser] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Hydration check + auth check
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, []);

    useEffect(() => {
        if (!user) return;
        fetchGrievances();
        fetchDepartments();
    }, [user]);

    const fetchGrievances = async () => {
        if (!user?._id) return;
        try {
            const data = await getUserGrievances(user._id);
            setGrievances(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const data = await getDepartments();
            const filteredData = data.filter((d: any) => !d.name.toLowerCase().includes("police") && !d.name.toLowerCase().includes("decentralized justice"));
            setDepartments(filteredData);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createGrievance({
                title,
                description,
                department: departmentId,
                raisedBy: user._id
            });
            alert('Grievance Submitted!');
            fetchGrievances(); // Refresh list
            setTitle('');
            setDescription('');
        } catch (error) {
            alert('Error submitting grievance');
        } finally {
            setIsSubmitting(false);
        }
    };

    const [selectedDeptStats, setSelectedDeptStats] = useState<any>(null);

    const handleDeptChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const deptId = e.target.value;
        if (deptId === "POLICE_FLOW") {
            setDepartmentId("POLICE_FLOW");
            setSelectedDeptStats(null);
            return;
        }

        setDepartmentId(deptId);
        if (deptId) {
            const dept = departments.find((d: any) => d._id === deptId);
            setSelectedDeptStats(dept);
        } else {
            setSelectedDeptStats(null);
        }
    };

    function InfoSlideshow() {
        const slides = [
            {
                title: "Welcome to the Digital Citizen Portal",
                desc: "A transparent, fast, and unified hub for all government services.",
                icon: <Building2 className="h-10 w-10 text-red-500" />
            },
            {
                title: "Direct Department Communication",
                desc: "Submit requests, track resolutions in real-time, and message officials securely.",
                icon: <MessageSquare className="h-10 w-10 text-red-500" />
            },
            {
                title: "Stay Updated with Official News",
                desc: "Access the latest broadcasts, policy updates, and welfare programs directly.",
                icon: <BarChart3 className="h-10 w-10 text-red-500" />
            },
            {
                title: "Secure & Private Data Handling",
                desc: "Your data is protected with state-of-the-art encryption and strict privacy protocols.",
                icon: <ShieldCheck className="h-10 w-10 text-red-500" />
            }
        ];
        
        const [currentSlide, setCurrentSlide] = useState(0);

        useEffect(() => {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
            }, 5000);
            return () => clearInterval(timer);
        }, [slides.length]);

        return (
            <Card className="overflow-hidden border border-red-900/40 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_0_50px_rgba(239,68,68,0.15)] rounded-[2rem] md:rounded-[2.5rem] relative min-h-[350px] md:min-h-[400px] flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-900/20 via-black to-red-950/10 opacity-80" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 group-hover:opacity-30 transition-opacity duration-1000 pointer-events-none" />
                <CardContent className="p-8 md:p-12 pb-16 md:pb-20 text-center relative z-10 w-full h-full">
                    {slides.map((slide, index) => (
                        <div 
                            key={index}
                            className={cn(
                                "absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-1000 ease-in-out",
                                currentSlide === index ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95 pointer-events-none"
                            )}
                        >
                            <div className="mb-6 p-5 bg-black/60 rounded-3xl border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.3)] backdrop-blur-xl">
                                {slide.icon}
                            </div>
                            <h3 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 tracking-tight uppercase mb-4 leading-tight max-w-2xl mx-auto">{slide.title}</h3>
                            <p className="text-sm md:text-lg font-bold text-zinc-200 max-w-xl mx-auto leading-relaxed">{slide.desc}</p>
                        </div>
                    ))}
                </CardContent>
                
                {/* Dots */}
                <div className="absolute bottom-6 md:bottom-8 left-0 right-0 flex justify-center gap-3 z-20">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={cn(
                                "h-2 rounded-full transition-all duration-700",
                                currentSlide === idx ? "w-10 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]" : "w-2.5 bg-red-950 hover:bg-red-800"
                            )}
                        />
                    ))}
                </div>
            </Card>
        );
    }

    // Sub-component to fetch and display officials
    function KeyOfficialsList({ deptId }: { deptId: string }) {
        const [officials, setOfficials] = useState([]);
        const [messageModalOpen, setMessageModalOpen] = useState(false);
        const [selectedRecipient, setSelectedRecipient] = useState<any>(null);

        useEffect(() => {
            if (!deptId) return;
            getPublicEmployees(deptId)
                .then((data: any) => setOfficials(data))
                .catch((err: any) => console.error(err));
        }, [deptId]);

        const handleMessageClick = (emp: any) => {
            setSelectedRecipient(emp);
            setMessageModalOpen(true);
        };

        const handleMessageSuccess = () => {
            window.location.reload(); // Refresh to show new message
        };

        if (officials.length === 0) return <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic">No public contacts listed.</p>;

        return (
            <>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {officials.map((emp: any) => (
                        <div key={emp._id} className="flex items-start justify-between gap-3 bg-black/40 p-4 rounded-2xl border border-red-900/10 hover:border-red-500/30 transition-all group">
                            <div className="flex gap-4">
                                <div className="bg-red-600 text-white h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                    {emp.name.charAt(0)}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-black text-white group-hover:text-red-500 transition-colors">{emp.name}</p>
                                    <p className="text-[10px] text-red-600 font-black uppercase tracking-widest">{emp.role}</p>
                                    <p className="text-[10px] text-zinc-200 font-bold">{emp.email}</p>
                                </div>
                            </div>

                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[10px] px-3 border-red-900/30 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                                onClick={() => handleMessageClick(emp)}
                            >
                                MESSAGE
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Message Modal */}
                {selectedRecipient && (
                    <MessageCard
                        isOpen={messageModalOpen}
                        onClose={() => setMessageModalOpen(false)}
                        recipient={selectedRecipient}
                        departmentId={deptId}
                        onSuccess={handleMessageSuccess}
                    />
                )}
            </>
        );
    }

    if (!user) return null; // Or loading spinner

    return (
        <div className="min-h-screen dashboard-container">
            {/* Top Bar for User Info */}
            <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-2xl border-b border-red-900/30 px-4 md:px-8 py-4 md:py-5 flex justify-between items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div>
                    <h2 className="text-[8px] md:text-[10px] font-black text-red-500 uppercase tracking-[0.4em] text-red-glow mb-1">GOVERNMENT PORTAL</h2>
                    <p className="text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 leading-none">Welcome, {user.name}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center text-white font-black shadow-[0_0_30px_rgba(239,68,68,0.5)] text-sm md:text-xl border border-red-400/30">
                        {user.name.charAt(0)}
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto bg-grid-red pb-24 md:pb-8">
                {/* Department Selection Card */}
                <Card className="relative overflow-hidden border border-red-900/30 bg-black/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[1.5rem] md:rounded-[2.5rem] group">
                    <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none" />
                    <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-red-500 to-red-900" />
                    <CardHeader className="p-6 md:p-8 md:pb-4 relative z-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-red-950/40 rounded-xl text-red-500 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 text-xl md:text-2xl font-black tracking-tight">Public Services</CardTitle>
                        </div>
                        <CardDescription className="text-zinc-200 text-xs md:text-sm font-bold tracking-wide">Access government services and check department resolution status.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 md:pt-6 relative z-10">
                        <div className="relative group/select">
                            <select
                                className="appearance-none w-full bg-zinc-950/80 border-2 border-red-900/30 text-white text-base rounded-2xl focus:ring-0 focus:border-red-500 block p-5 shadow-inner transition-all hover:bg-zinc-900/90 outline-none font-bold tracking-wide"
                                value={departmentId}
                                onChange={handleDeptChange}
                            >
                                <option value="" className="bg-zinc-900 text-zinc-300">-- Select Department --</option>
                                <option value="POLICE_FLOW" className="font-black bg-zinc-900 text-red-500">Department of Justice</option>
                                <option disabled className="bg-zinc-900">──────────────────────────────</option>
                                {departments.map((dept: any) => (
                                    <option key={dept._id} value={dept._id} className="bg-zinc-900 font-bold">{dept.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-red-900 group-hover:text-red-500 transition-colors">
                                <ArrowRight className="h-5 w-5 rotate-90" />
                            </div>
                        </div>

                        {departmentId === "POLICE_FLOW" ? (
                            <div className="mt-6 md:mt-8 animate-in">
                                <JusticePortal user={user} />
                            </div>
                        ) : selectedDeptStats && (
                            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in">
                                <div className="p-5 md:p-6 rounded-2xl bg-zinc-950 border border-red-900/20 shadow-xl transition-all hover:border-red-600/30">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-red-950/30 rounded-lg border border-red-900/30 text-red-500">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <span className="text-[8px] md:text-[10px] font-black text-red-500 bg-red-950/50 border border-red-900/30 px-2 py-0.5 rounded-full uppercase">Current</span>
                                    </div>
                                    <p className="text-2xl md:text-3xl font-black text-white">{selectedDeptStats.metrics?.pendingFiles || 0}</p>
                                    <p className="text-[10px] text-zinc-200 font-black uppercase tracking-widest mt-1">Pending Requests</p>
                                </div>

                                <div className="p-5 md:p-6 rounded-2xl bg-zinc-950 border border-red-900/20 shadow-xl transition-all hover:border-red-600/30">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-red-950/30 rounded-lg border border-red-900/30 text-red-500">
                                            <CheckCircle className="h-5 w-5" />
                                        </div>
                                        <span className="text-[8px] md:text-[10px] font-black text-red-500 bg-red-950/50 border border-red-900/30 px-2 py-0.5 rounded-full uppercase">Resolved</span>
                                    </div>
                                    <p className="text-2xl md:text-3xl font-black text-white">{selectedDeptStats.metrics?.filesCleared || 0}</p>
                                    <p className="text-[10px] text-zinc-200 font-black uppercase tracking-widest mt-1">Completed Requests</p>
                                </div>

                                <div className="p-5 md:p-6 rounded-2xl bg-zinc-950 border border-red-900/20 shadow-xl transition-all hover:border-red-600/30 sm:col-span-2 lg:col-span-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-red-950/30 rounded-lg border border-red-900/30 text-red-500">
                                            <Activity className="h-5 w-5" />
                                        </div>
                                        <span className="text-[8px] md:text-[10px] font-black text-red-500 bg-red-950/50 border border-red-900/30 px-2 py-0.5 rounded-full uppercase">Rating</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl md:text-3xl font-black text-white">{selectedDeptStats.metrics?.efficiency || 0}%</p>
                                        <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-1">Success Rate</p>
                                    </div>
                                    <div className="w-full bg-black/50 rounded-full h-1.5 mt-4 overflow-hidden border border-zinc-900">
                                        <div
                                            className="bg-red-600 h-full rounded-full shadow-[0_0_10px_rgba(220,38,38,0.3)] transition-all duration-1000"
                                            style={{ width: `${selectedDeptStats.metrics?.efficiency || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Slideshow when no department is selected */}
                {!departmentId && (
                    <div className="mt-8 animate-in fade-in duration-1000 slide-in-from-bottom-8">
                        <InfoSlideshow />
                    </div>
                )}

                {departmentId && departmentId !== "POLICE_FLOW" && (
                    <div className="grid lg:grid-cols-5 gap-8 animate-in" style={{ animationDelay: '0.2s' }}>
                        {/* Form Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="h-fit bg-zinc-950/50 border-red-900/20 backdrop-blur-md shadow-2xl rounded-[1.5rem] md:rounded-[2rem]">
                                <CardHeader className="p-5 md:p-6">
                                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                                        <ShieldCheck className="h-5 w-5 text-red-600" />
                                        Submit Request
                                    </CardTitle>
                                    <CardDescription className="text-zinc-300 text-[10px] font-black uppercase tracking-widest">Public Submission</CardDescription>
                                </CardHeader>
                                <CardContent className="p-5 md:p-6 md:pt-0">
                                    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-200 uppercase tracking-widest ml-1">Subject</label>
                                            <Input
                                                value={title}
                                                className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-200 h-12 md:h-14 rounded-xl focus:ring-red-600 transition-all shadow-inner font-bold"
                                                placeholder="Enter subject"
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-200 uppercase tracking-widest ml-1">Description</label>
                                            <Textarea
                                                rows={5}
                                                className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-200 rounded-xl focus:ring-red-600 focus:outline-none transition-all resize-none shadow-inner p-4 font-bold"
                                                placeholder="Provide detailed description..."
                                                value={description}
                                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-14 md:h-16 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl md:rounded-2xl shadow-[0_10px_30px_rgba(239,68,68,0.3)] transition-all active:scale-[0.98]"
                                        >
                                            {isSubmitting ? "Submitting..." : "Send Request"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-950/50 border border-red-900/20 backdrop-blur-md shadow-2xl rounded-[1.5rem] md:rounded-[2rem]">
                                <CardHeader className="pb-0 p-5 md:p-8 md:pt-8">
                                    <CardTitle className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">Department Contacts</CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 md:p-8 md:pt-6 pb-8">
                                    <KeyOfficialsList deptId={departmentId} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* List Column */}
                        <div className="lg:col-span-3">
                            <Card className="min-h-full bg-zinc-950/50 border-red-900/20 backdrop-blur-md shadow-2xl rounded-[1.5rem] md:rounded-[2rem]">
                                <CardHeader className="flex flex-row items-center justify-between p-5 md:p-8 md:pb-4">
                                    <div>
                                        <CardTitle className="text-white text-lg md:text-2xl font-black">Past Requests</CardTitle>
                                        <CardDescription className="text-zinc-300 text-[10px] font-black uppercase tracking-widest mt-1">Track Interactions</CardDescription>
                                    </div>
                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-red-950/30 border border-red-900/30 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                                        <History className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5 md:p-8 md:pt-4">
                                    <div className="space-y-4">
                                        {grievances.length === 0 ? (
                                            <div className="text-center py-24">
                                                <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-black/40 mb-6 border border-red-900/20">
                                                    <AlertCircle className="h-10 w-10 text-zinc-800" />
                                                </div>
                                                <p className="text-zinc-300 font-black uppercase tracking-widest text-xs">You haven't submitted any requests yet.</p>
                                            </div>
                                        ) : (
                                            grievances.map((g: any, idx: number) => (
                                                <div
                                                    key={g._id}
                                                    className="group relative p-6 rounded-3xl bg-black/40 border border-red-900/10 hover:border-red-500/30 hover:bg-black/60 transition-all animate-in"
                                                    style={{ animationDelay: `${0.1 * idx}s` }}
                                                >
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h4 className="font-black text-white text-lg group-hover:text-red-500 transition-colors tracking-tight">{g.title}</h4>
                                                                <span className={cn(
                                                                    "status-badge",
                                                                    g.status === 'Resolved' ? "status-badge-resolved" :
                                                                        g.status === 'Rejected' ? "status-badge-rejected" :
                                                                            "status-badge-pending"
                                                                )}>
                                                                    <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse",
                                                                        g.status === 'Resolved' ? "bg-emerald-500" :
                                                                            g.status === 'Rejected' ? "bg-red-500" :
                                                                                "bg-amber-500"
                                                                    )} />
                                                                    {g.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] font-black text-zinc-300 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                                                <Building2 className="h-3 w-3 text-zinc-200" />
                                                                {g.addressedTo ? `ASSIGNED OFFICER: ${g.addressedTo}` : g.department?.name}
                                                                <span className="text-zinc-800">•</span>
                                                                {new Date(g.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                                                            </p>

                                                            {g.resolutionNotes && (
                                                                <div className="mt-4 p-5 rounded-2xl bg-black border border-red-900/20 shadow-inner relative overflow-hidden">
                                                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
                                                                    <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 opacity-50">Officer Response</div>
                                                                    <p className="text-sm text-zinc-300 font-bold leading-relaxed italic">"{g.resolutionNotes}"</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Actions */}
                                                        <div className="flex flex-col gap-2">
                                                            {(g.status === 'Resolved' || g.status === 'Rejected') && g.canReopen && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="rounded-xl border-red-900/30 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 gap-2 font-black text-[10px] uppercase tracking-widest transition-all"
                                                                    onClick={async () => {
                                                                        try {
                                                                            await reopenGrievance(g._id, user._id);
                                                                            fetchGrievances();
                                                                        } catch (error: any) {
                                                                            alert(error.response?.data?.message || 'Error reopening grievance');
                                                                        }
                                                                    }}
                                                                >
                                                                    ðŸ”„ REOPEN
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
