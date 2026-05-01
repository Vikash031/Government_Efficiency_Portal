
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
            setDepartments(data);
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

        if (officials.length === 0) return <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">No public contacts listed.</p>;

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
                                    <p className="text-[10px] text-zinc-400 font-bold">{emp.email}</p>
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
            <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-xl border-b border-red-900/20 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center">
                <div>
                    <h2 className="text-[8px] md:text-[10px] font-black text-red-500 uppercase tracking-[0.3em] text-red-glow">GOVERNMENT PORTAL</h2>
                    <p className="text-base md:text-xl font-black text-white leading-none mt-0.5">Welcome, {user.name}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl md:rounded-2xl bg-red-600 flex items-center justify-center text-white font-black shadow-[0_0_20px_rgba(239,68,68,0.4)] text-xs md:text-base">
                        {user.name.charAt(0)}
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto bg-grid-red pb-24 md:pb-8">
                {/* Department Selection Card */}
                <Card className="overflow-hidden border border-red-900/20 bg-zinc-950/50 backdrop-blur-md shadow-2xl shadow-black rounded-[1.5rem] md:rounded-[2rem]">
                    <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-900" />
                    <CardHeader className="p-5 md:p-6 md:pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-950/50 rounded-lg text-red-500 border border-red-900/30">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-white text-lg md:text-xl">Public Services</CardTitle>
                        </div>
                        <CardDescription className="text-zinc-300 text-[10px] md:text-xs font-bold">Access government services and check department resolution status.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 md:p-6 md:pt-6">
                        <div className="relative group">
                            <select
                                className="appearance-none w-full bg-black/40 border border-red-900/30 text-white text-sm rounded-xl focus:ring-red-600 focus:border-red-600 block p-4 shadow-inner transition-all hover:bg-black/60 hover:border-red-500 outline-none font-bold"
                                value={departmentId}
                                onChange={handleDeptChange}
                            >
                                <option value="" className="bg-zinc-900 text-zinc-400">-- Select Department --</option>
                                <option value="POLICE_FLOW" className="font-black bg-zinc-900 text-red-500">👮 Citizen Grievance Portal</option>
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
                                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1">Pending Requests</p>
                                </div>

                                <div className="p-5 md:p-6 rounded-2xl bg-zinc-950 border border-red-900/20 shadow-xl transition-all hover:border-red-600/30">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-red-950/30 rounded-lg border border-red-900/30 text-red-500">
                                            <CheckCircle className="h-5 w-5" />
                                        </div>
                                        <span className="text-[8px] md:text-[10px] font-black text-red-500 bg-red-950/50 border border-red-900/30 px-2 py-0.5 rounded-full uppercase">Resolved</span>
                                    </div>
                                    <p className="text-2xl md:text-3xl font-black text-white">{selectedDeptStats.metrics?.filesCleared || 0}</p>
                                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1">Completed Requests</p>
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
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Subject</label>
                                            <Input
                                                value={title}
                                                className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-700 h-12 md:h-14 rounded-xl focus:ring-red-600 transition-all shadow-inner font-bold"
                                                placeholder="Enter subject"
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Description</label>
                                            <Textarea
                                                rows={5}
                                                className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-700 rounded-xl focus:ring-red-600 focus:outline-none transition-all resize-none shadow-inner p-4 font-bold"
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
                                                <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">You haven't submitted any requests yet.</p>
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
                                                                <Building2 className="h-3 w-3 text-zinc-400" />
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
                                                                    🔄 REOPEN
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
