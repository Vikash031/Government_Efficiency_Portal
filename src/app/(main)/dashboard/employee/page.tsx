"use client";

import { useState, useEffect } from 'react';
import { getEmployeeGrievances, updateGrievanceStatus } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, User, CheckCircle, XCircle, ArrowRight, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EmployeeDashboard() {
    const [employee, setEmployee] = useState<any>(null);
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resolutionNotes, setResolutionNotes] = useState<{ [key: string]: string }>({});
    const router = useRouter();

    useEffect(() => {
        const empData = JSON.parse(localStorage.getItem('employee') || '{}');
        if (empData && empData._id) {
            setEmployee(empData);
            fetchGrievances(empData._id);
        } else {
            router.push('/employee/login');
        }
    }, []);

    const fetchGrievances = async (empId: string) => {
        try {
            const data = await getEmployeeGrievances(empId);
            setGrievances(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'Resolved' | 'Rejected' | 'Pass', notes?: string) => {
        const note = notes || resolutionNotes[id] || (action === 'Pass' ? 'Passed to Admin' : '');

        if (!note && action !== 'Pass') {
            alert('Please add a note before resolving/rejecting.');
            return;
        }

        try {
            let status = 'Pending'; // Default
            if (action === 'Resolved') status = 'Resolved';
            if (action === 'Rejected') status = 'Rejected';

            await updateGrievanceStatus(id, status, note);

            alert(`Action Taken: ${action}`);
            if (employee) fetchGrievances(employee._id);
        } catch (error) {
            console.error(error);
            alert('Error updating grievance');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen dashboard-container">
            {/* Top Bar for Employee Info */}
            <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-xl border-b border-red-900/20 px-8 py-4 flex justify-between items-center">
                <div>
                    <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] text-red-glow">Department Dashboard</h2>
                    <p className="text-xl font-black text-white">Welcome, {employee?.name}</p>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-1 border border-red-900/30 px-2 py-0.5 rounded w-fit">{employee?.department?.name}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            localStorage.removeItem('employee');
                            router.push('/employee/login');
                        }}
                        className="text-zinc-400 hover:text-red-500 font-black text-[10px] uppercase tracking-widest"
                    >
                        LOGOUT
                    </Button>
                    <div className="h-10 w-10 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                        {employee?.name?.charAt(0)}
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-8 max-w-7xl mx-auto bg-grid-red">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <MessageSquare className="h-6 w-6 text-red-600" /> 
                        Incoming Grievances
                    </h2>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{grievances.length} Active Grievances</span>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {grievances.length === 0 ? (
                        <div className="col-span-full py-32 text-center bg-zinc-950/50 border border-red-900/10 rounded-[3rem] backdrop-blur-md">
                            <Briefcase className="h-16 w-16 text-red-900/20 mx-auto mb-4" />
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">No pending tasks assigned in the system.</p>
                        </div>
                    ) : (
                        grievances.map((g: any, idx: number) => (
                            <Card key={g._id} className="flex flex-col h-full bg-zinc-950/50 border border-red-900/20 backdrop-blur-md shadow-2xl rounded-[2rem] overflow-hidden group hover:border-red-600/30 transition-all animate-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <CardHeader className="bg-red-950/20 p-6 border-b border-red-900/10">
                                    <CardTitle className="text-white text-lg font-black group-hover:text-red-500 transition-colors line-clamp-1">{g.title}</CardTitle>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-widest mt-2">
                                        <User className="h-3 w-3" />
                                        {g.raisedBy?.name || 'Anonymous User'}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 p-6 space-y-6">
                                    <div className="p-4 rounded-2xl bg-black border border-red-900/20 shadow-inner min-h-[120px] max-h-[120px] overflow-y-auto custom-scrollbar relative">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-red-600/30" />
                                        <p className="text-sm text-zinc-100 font-bold leading-relaxed">
                                            {g.description}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Resolution Response</label>
                                        <Textarea
                                            placeholder="Enter resolution notes..."
                                            className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-800 rounded-2xl focus:ring-red-600 focus:outline-none transition-all resize-none shadow-inner p-4 font-bold text-xs"
                                            value={resolutionNotes[g._id] || ''}
                                            onChange={(e) => setResolutionNotes({ ...resolutionNotes, [g._id]: e.target.value })}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-3 p-6 pt-0">
                                    <Button
                                        className="w-full bg-red-600 hover:bg-red-700 h-12 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-[0_10px_20px_rgba(239,68,68,0.2)] transition-all active:scale-[0.98]"
                                        onClick={() => handleAction(g._id, 'Resolved')}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" /> Resolve
                                    </Button>
                                    <div className="flex gap-3 w-full">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-red-900/30 text-red-500 hover:bg-red-600 hover:text-white rounded-xl h-12 text-[9px] font-black uppercase tracking-widest transition-all"
                                            onClick={() => handleAction(g._id, 'Pass')}
                                        >
                                            <ArrowRight className="mr-2 h-4 w-4" /> Escalate
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-red-900/10 text-zinc-700 hover:bg-zinc-900 hover:text-white rounded-xl h-12 text-[9px] font-black uppercase tracking-widest transition-all"
                                            onClick={() => handleAction(g._id, 'Rejected')}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" /> Discard
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
