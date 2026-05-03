"use client";

import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog as UIDialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { getDepartments, getDepartmentGrievances, getCensusStats, updateGrievanceStatus, updateDepartmentMetrics, createScheme, getSchemes, getNews, createNews } from '@/lib/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { FileText, LayoutDashboard, Database, Briefcase, ShieldCheck, LogOut, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

import JusticeAdminDashboard from '@/components/JusticeAdminDashboard';
import EOfficeBoard from '@/components/EOfficeBoard';
import ResourceTracker from '@/components/ResourceTracker';

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'files', 'resources', 'publishing'
    const [news, setNews] = useState([]);
    const [schemesList, setSchemesList] = useState([]);
    const [isLoadingNews, setIsLoadingNews] = useState(true);
    const [isLoadingSchemes, setIsLoadingSchemes] = useState(true);

    // News Form State
    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [newsCategory, setNewsCategory] = useState('General');

    const [grievances, setGrievances] = useState([]);
    const [resolutionNote, setResolutionNote] = useState('');
    const [selectedGrievance, setSelectedGrievance] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State for user/department
    const [department, setDepartment] = useState<any>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const dep = JSON.parse(localStorage.getItem('department') || '{}');
        setDepartment(dep);
        if (!dep || !dep._id) {
            router.push('/admin/login');
        }
    }, []);

    // Stats State
    const [metrics, setMetrics] = useState<any>({
        efficiency: 0,
        filesCleared: 0,
        pendingFiles: 0
    });

    // Census Data
    const [censusData, setCensusData] = useState<any>(null);

    // Loading and Error States
    const [isLoadingGrievances, setIsLoadingGrievances] = useState(true);
    const [isLoadingCensus, setIsLoadingCensus] = useState(true);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Scheme State
    const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
    const [newSchemeTitle, setNewSchemeTitle] = useState('');
    const [newSchemeDesc, setNewSchemeDesc] = useState('');

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    useEffect(() => {
        if (!department._id) return;

        // Fix Persistence: Load fresh department data to ensure metrics are current
        setIsLoadingMetrics(true);
        getDepartments()
            .then(departments => {
                const currentDept = departments.find((d: any) => d._id === department._id);
                if (currentDept && currentDept.metrics) {
                    setMetrics(currentDept.metrics);
                }
            })
            .catch(err => {
                console.error('Error fetching departments:', err);
                setError('Failed to load department metrics');
            })
            .finally(() => setIsLoadingMetrics(false));

        fetchGrievances();
        fetchCensusStats();
        fetchNews();
        fetchSchemesList();
    }, [department._id]);

    const fetchSchemesList = async () => {
        setIsLoadingSchemes(true);
        try {
            const data = await getSchemes();
            setSchemesList(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingSchemes(false);
        }
    };

    const fetchNews = async () => {
        setIsLoadingNews(true);
        try {
            const data = await getNews();
            setNews(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingNews(false);
        }
    };

    const fetchGrievances = async () => {
        if (!department._id) return;
        setIsLoadingGrievances(true);
        try {
            const data = await getDepartmentGrievances(department._id);
            setGrievances(data);
            setError(null);
        } catch (error) {
            console.error(error);
            setError('Failed to load grievances');
        } finally {
            setIsLoadingGrievances(false);
        }
    };

    const fetchCensusStats = async () => {
        setIsLoadingCensus(true);
        try {
            const data = await getCensusStats();
            setCensusData(data);
        } catch (error) {
            console.error("Error fetching census data", error);
            // Census data is optional, don't set error state
        } finally {
            setIsLoadingCensus(false);
        }
    };

    const openGrievanceModal = (grievance: any) => {
        setSelectedGrievance(grievance);
        setResolutionNote(grievance.resolutionNotes || '');
        setIsModalOpen(true);
    };

    const handleUpdateStatus = async (status: string) => {
        if (!selectedGrievance) return;
        try {
            await updateGrievanceStatus(selectedGrievance._id, status, resolutionNote);
            // Success feedback
            setResolutionNote('');
            setIsModalOpen(false);
            fetchGrievances();
            // Show success message in console for now
            console.log(`âœ… Grievance marked as ${status}`);
        } catch (error) {
            console.error('Error updating status:', error);
            setError(`Failed to update grievance status`);
        }
    };

    const handleUpdateMetrics = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate metrics
        if (metrics.filesCleared < 0 || metrics.pendingFiles < 0) {
            setError('File counts cannot be negative');
            return;
        }

        try {
            const res = await updateDepartmentMetrics(department._id, {
                filesCleared: metrics.filesCleared,
                pendingFiles: metrics.pendingFiles
            });
            // Update LocalStorage to keep session in sync, though we rely on refetch mostly
            const updatedDept = { ...department, metrics: res.data.metrics };
            localStorage.setItem('department', JSON.stringify(updatedDept));
            setError(null);
            alert('Statistics updated successfully!');
            console.log('âœ… Department Statistics Updated!');
        } catch (error) {
            console.error(error);
            setError('Failed to update statistics. Please try again.');
            alert('Failed to update statistics. Check console for details.');
        }
    };

    const handleCreateScheme = async () => {
        if (!newSchemeTitle || !newSchemeDesc) return;
        try {
            await createScheme({
                title: newSchemeTitle,
                description: newSchemeDesc,
                departmentId: department._id
            });
            alert('Scheme Created Successfully!');
            setIsSchemeModalOpen(false);
            setNewSchemeTitle('');
            setNewSchemeDesc('');
            fetchSchemesList();
        } catch (error) {
            console.error(error);
            alert('Failed to create scheme.');
        }
    };

    const handleCreateNews = async () => {
        if (!newsTitle || !newsContent) return;
        try {
            await createNews({
                title: newsTitle,
                content: newsContent,
                departmentId: department._id,
                category: newsCategory
            });
            alert('News Published Successfully!');
            setIsNewsModalOpen(false);
            setNewsTitle('');
            setNewsContent('');
            fetchNews();
        } catch (error) {
            console.error(error);
            alert('Failed to publish news.');
        }
    };

    if (!mounted) return null;
    if (!department._id) return null;

    // Special Police Admin Flow
    if (department.name?.includes("Police") || department.username === 'police_admin' || department.username === 'admin_police') {
        return (
            <div className="min-h-screen bg-black text-white">
                <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-red-900/30 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-600 rounded-lg shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-[8px] md:text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-0.5">LAW ENFORCEMENT</h2>
                            <h1 className="text-base md:text-xl font-black tracking-tight uppercase leading-none">Command Center</h1>
                        </div>
                    </div>
                    <Button 
                        variant="ghost"
                        onClick={() => {
                            localStorage.clear();
                            router.push('/login');
                        }}
                        className="h-10 px-4 md:px-6 bg-red-950/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-900/30 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all"
                    >
                        <LogOut className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Terminate</span>
                    </Button>
                </header>
                <div className="p-4 md:p-8 pb-24 md:pb-8">
                    <JusticeAdminDashboard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-red-500/30">
            {/* Top Bar for Admin Info */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-red-900/20 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600 rounded-lg shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-[8px] md:text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-0.5">ADMINISTRATION</h2>
                        <h1 className="text-base md:text-xl font-black tracking-tight uppercase leading-none">{department.name}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            localStorage.removeItem('department');
                            router.push('/admin/login');
                        }}
                        className="h-10 px-4 md:px-6 bg-red-950/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-900/30 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all"
                    >
                        <LogOut className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Logout</span>
                    </Button>
                </div>
            </div>

            <div className="container mx-auto p-4 md:p-8 space-y-6 md:space-y-8 flex-1 pb-24 md:pb-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-zinc-950 border border-red-900/20 shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-red-950/30 rounded-lg border border-red-900/30 text-red-500">
                                <Clock className="h-5 w-5" />
                            </div>
                            <span className="text-[8px] md:text-[10px] font-black text-red-500 bg-red-950/50 border border-red-900/30 px-2 py-0.5 rounded-full uppercase">Queue</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-white">{grievances.filter((g: any) => g.status === 'Pending').length}</p>
                        <p className="text-[10px] text-zinc-200 font-black uppercase tracking-widest mt-1">Pending Grievances</p>
                    </div>

                    <div className="p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-zinc-950 border border-red-900/20 shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-emerald-950/30 rounded-lg border border-emerald-900/30 text-emerald-500">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <span className="text-[8px] md:text-[10px] font-black text-emerald-500 bg-emerald-950/50 border border-emerald-900/30 px-2 py-0.5 rounded-full uppercase">Success</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-white">{grievances.filter((g: any) => g.status === 'Resolved').length}</p>
                        <p className="text-[10px] text-zinc-200 font-black uppercase tracking-widest mt-1">Resolved Tasks</p>
                    </div>

                    <div className="p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-zinc-950 border border-red-900/20 shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-amber-950/30 rounded-lg border border-amber-900/30 text-amber-500">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <span className="text-[8px] md:text-[10px] font-black text-amber-500 bg-amber-950/50 border border-amber-900/30 px-2 py-0.5 rounded-full uppercase">Alert</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-white">{grievances.filter((g: any) => g.status === 'Under Review').length}</p>
                        <p className="text-[10px] text-zinc-200 font-black uppercase tracking-widest mt-1">Critical Review</p>
                    </div>

                    <div className="p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-zinc-950 border border-red-900/20 shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-200">
                                <Users className="h-5 w-5" />
                            </div>
                            <span className="text-[8px] md:text-[10px] font-black text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full uppercase">Staff</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-white">{department?.employees?.length || 0}</p>
                        <p className="text-[10px] text-zinc-200 font-black uppercase tracking-widest mt-1">Personnel Active</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-nowrap md:flex-wrap gap-2 md:gap-4 bg-zinc-950/50 p-2 rounded-2xl md:rounded-[2rem] border border-red-900/10 w-fit backdrop-blur-md overflow-x-auto max-w-full custom-scrollbar">
                    {['dashboard', 'files', 'resources', 'publishing'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "whitespace-nowrap px-6 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all duration-300",
                                activeTab === tab
                                    ? "bg-red-600 text-white shadow-[0_5px_20px_rgba(239,68,68,0.3)] scale-[1.02]"
                                    : "text-zinc-300 hover:text-white hover:bg-red-950/30"
                            )}
                        >
                            {tab === 'dashboard' ? 'Stats Center' : tab === 'files' ? 'Digital Desk' : tab === 'resources' ? 'Asset Tracker' : 'Broadcasts'}
                        </button>
                    ))}
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-950/20 border border-red-600/30 text-red-500 px-4 py-3 rounded-xl relative" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                        <button
                            className="absolute top-0 bottom-0 right-0 px-4 py-3"
                            onClick={() => setError(null)}
                        >
                            <span className="text-red-500 text-xl">Ã—</span>
                        </button>
                    </div>
                )}

                {/* VIEW: MAIN DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6 md:space-y-8 animate-in">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                            {/* Metrics Section */}
                            <Card className="bg-zinc-950/50 border-red-900/20 backdrop-blur-md shadow-2xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
                                <CardHeader className="border-b border-red-900/10 p-6 md:p-8">
                                    <CardTitle className="text-white text-base md:text-lg font-black uppercase tracking-widest">Efficiency Metrics</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 md:p-8">
                                    {isLoadingMetrics ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                                            <div className="h-8 w-8 border-4 border-red-900/30 border-t-red-600 rounded-full animate-spin" />
                                            <p className="text-zinc-200 font-bold text-[10px] uppercase tracking-widest">Loading stats...</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleUpdateMetrics} className="space-y-6 md:space-y-8">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Resolved Items</label>
                                                    <Input
                                                        type="number"
                                                        value={metrics.filesCleared || 0}
                                                        className="bg-black/40 border-red-900/30 text-white h-12 md:h-14 rounded-xl md:rounded-2xl focus:ring-red-600"
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setMetrics({ ...metrics, filesCleared: Number(e.target.value) })}
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Queue Size</label>
                                                    <Input
                                                        type="number"
                                                        value={metrics.pendingFiles || 0}
                                                        className="bg-black/40 border-red-900/30 text-white h-12 md:h-14 rounded-xl md:rounded-2xl focus:ring-red-600"
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setMetrics({ ...metrics, pendingFiles: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-5 md:p-6 bg-red-950/20 border border-red-900/30 rounded-2xl md:rounded-3xl">
                                                <div className="flex justify-between items-baseline mb-3">
                                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">Operational Efficiency</p>
                                                    <p className="text-2xl md:text-3xl font-black text-white">
                                                        {(metrics.filesCleared + metrics.pendingFiles) === 0 ? 0 :
                                                            Math.round((metrics.filesCleared / (metrics.filesCleared + metrics.pendingFiles)) * 100)
                                                        }%
                                                    </p>
                                                </div>
                                                <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden border border-red-900/10">
                                                    <div 
                                                        className="h-full bg-red-600 transition-all duration-1000 shadow-[0_0_15px_rgba(255,0,0,0.5)]"
                                                        style={{ width: `${(metrics.filesCleared + metrics.pendingFiles) === 0 ? 0 : Math.round((metrics.filesCleared / (metrics.filesCleared + metrics.pendingFiles)) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <Button type="submit" className="w-full h-12 md:h-14 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] tracking-widest uppercase rounded-xl md:rounded-2xl transition-all shadow-lg">Update Records</Button>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Demographic Overview Snippet */}
                            <Card className="bg-zinc-950/50 border-red-900/20 backdrop-blur-md shadow-2xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
                                <CardHeader className="border-b border-red-900/10 p-6 md:p-8">
                                    <CardTitle className="text-white text-base md:text-lg font-black uppercase tracking-widest">Regional Demographics</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 md:p-8">
                                    {isLoadingCensus ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                                            <div className="h-8 w-8 border-4 border-red-900/30 border-t-red-600 rounded-full animate-spin" />
                                            <p className="text-zinc-200 font-bold text-[10px] uppercase tracking-widest">Analyzing data...</p>
                                        </div>
                                    ) : censusData && censusData.genderDistribution ? (
                                        <div className="w-full h-[280px] md:h-[320px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={censusData.genderDistribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={70}
                                                        outerRadius={100}
                                                        paddingAngle={8}
                                                        dataKey="count"
                                                        nameKey="_id"
                                                        label={(props: any) => props._id}
                                                    >
                                                        {censusData.genderDistribution.map((_entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid #991b1b', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                                                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 opacity-50">
                                            <Database className="h-12 w-12 text-zinc-200 mb-4" />
                                            <p className="text-zinc-300 font-black text-[10px] uppercase tracking-widest">Regional Data Unavailable</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Policy Analysis Data for Admin */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                            {/* Education & Employment */}
                            <Card className="bg-zinc-950/50 border-red-900/20 backdrop-blur-md shadow-2xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
                                <CardHeader className="border-b border-red-900/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-white text-base md:text-lg font-black uppercase tracking-widest">Education Policy Analysis</CardTitle>
                                        <p className="text-[10px] text-zinc-200 font-bold uppercase tracking-widest mt-1">Data for educational schemes</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 md:p-8">
                                    {isLoadingCensus ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                                            <div className="h-8 w-8 border-4 border-red-900/30 border-t-red-600 rounded-full animate-spin" />
                                        </div>
                                    ) : censusData && censusData.educationDistribution && censusData.educationDistribution.length > 0 ? (
                                        <div className="w-full h-[280px] md:h-[320px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={censusData.educationDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                    <XAxis dataKey="_id" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 900 }} />
                                                    <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 900 }} />
                                                    <Tooltip 
                                                        cursor={{ fill: 'rgba(239, 68, 68, 0.1)' }}
                                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid #991b1b', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                                                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                                    />
                                                    <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 opacity-50">
                                            <Database className="h-12 w-12 text-zinc-200 mb-4" />
                                            <p className="text-zinc-300 font-black text-[10px] uppercase tracking-widest">Insufficient Data</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Housing & Marital Stats */}
                            <Card className="bg-zinc-950/50 border-red-900/20 backdrop-blur-md shadow-2xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
                                <CardHeader className="border-b border-red-900/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-white text-base md:text-lg font-black uppercase tracking-widest">Housing & Welfare Analysis</CardTitle>
                                        <p className="text-[10px] text-zinc-200 font-bold uppercase tracking-widest mt-1">Data for housing & family policies</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 md:p-8">
                                    {isLoadingCensus ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                                            <div className="h-8 w-8 border-4 border-red-900/30 border-t-red-600 rounded-full animate-spin" />
                                        </div>
                                    ) : censusData && censusData.housingDistribution && censusData.housingDistribution.length > 0 ? (
                                        <div className="w-full h-[280px] md:h-[320px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={censusData.housingDistribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={70}
                                                        outerRadius={100}
                                                        paddingAngle={8}
                                                        dataKey="count"
                                                        nameKey="_id"
                                                        label={(props: any) => props._id}
                                                    >
                                                        {censusData.housingDistribution.map((_entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid #991b1b', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                                                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 opacity-50">
                                            <Database className="h-12 w-12 text-zinc-200 mb-4" />
                                            <p className="text-zinc-300 font-black text-[10px] uppercase tracking-widest">Insufficient Data</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Received Reports List */}
                        <Card className="bg-zinc-950/50 border-red-900/20 backdrop-blur-md shadow-2xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
                            <CardHeader className="border-b border-red-900/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-white text-base md:text-lg font-black uppercase tracking-widest">Grievance Registry</CardTitle>
                                    <p className="text-[10px] text-zinc-200 font-bold uppercase tracking-widest mt-1">Live incoming records</p>
                                </div>
                                <span className="w-fit px-4 py-1.5 bg-red-950/30 border border-red-900/30 text-red-500 text-[10px] font-black rounded-full uppercase tracking-widest">
                                    {grievances.length} Active Records
                                </span>
                            </CardHeader>
                            <CardContent className="p-4 md:p-8">
                                <div className="grid gap-4">
                                    {isLoadingGrievances ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                                            <div className="h-8 w-8 border-4 border-red-900/30 border-t-red-600 rounded-full animate-spin" />
                                            <p className="text-zinc-200 font-bold text-[10px] uppercase tracking-widest">Scanning Registry...</p>
                                        </div>
                                    ) : grievances.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-zinc-300 font-black text-[10px] uppercase tracking-[0.2em] italic mb-2">Registry Clear</p>
                                            <p className="text-zinc-800 text-[10px] font-bold uppercase tracking-widest">No pending items in queue</p>
                                        </div>
                                    ) : (
                                        grievances.map((g: any) => (
                                            <div
                                                key={g._id}
                                                className="group relative p-5 md:p-6 rounded-2xl md:rounded-3xl bg-black border border-red-900/10 hover:border-red-500/40 hover:bg-zinc-900/30 transition-all cursor-pointer overflow-hidden"
                                                onClick={() => openGrievanceModal(g)}
                                            >
                                                <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-red-900 group-hover:bg-red-600 transition-all" />
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                    <div className="space-y-1">
                                                        <h4 className="font-black text-base md:text-lg text-white uppercase tracking-tight group-hover:text-red-500 transition-colors">{g.title}</h4>
                                                        <p className="text-[11px] md:text-sm text-zinc-300 line-clamp-1 italic mb-2 md:mb-4">"{g.description}"</p>
                                                        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[9px] md:text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                                                            <span className="flex items-center gap-1.5 text-red-600"><Users className="h-3 w-3" /> {g.raisedBy?.name || 'Anonymous User'}</span>
                                                            <span className="hidden md:inline text-zinc-800">•</span>
                                                            <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {new Date(g.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 w-full md:w-auto">
                                                        <span className={cn(
                                                            "block md:inline-block text-center px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border",
                                                            g.status === 'Resolved' ? 'bg-emerald-950/30 text-emerald-500 border-emerald-900/30' :
                                                            g.status === 'Rejected' ? 'bg-red-950/30 text-red-500 border-red-900/30' :
                                                                'bg-amber-950/30 text-amber-500 border-amber-900/30'
                                                        )}>
                                                            {g.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* VIEW: E-OFFICE (FILES) */}
                {activeTab === 'files' && (
                    <div className="animate-in">
                        <EOfficeBoard departmentId={department._id} />
                    </div>
                )}

                {/* VIEW: RESOURCES */}
                {activeTab === 'resources' && (
                    <div className="animate-in">
                        <ResourceTracker departmentId={department._id} />
                    </div>
                )}

                {/* VIEW: BROADCASTS (PUBLISHING HUB) */}
                {activeTab === 'publishing' && (
                    <div className="space-y-6 md:space-y-8 animate-in">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                            <Card className="bg-zinc-950/50 border-red-900/20 backdrop-blur-md shadow-2xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
                                <CardHeader className="border-b border-red-900/10 p-6 md:p-8 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-white text-base md:text-lg font-black uppercase tracking-widest">Public Programs</CardTitle>
                                        <p className="text-[10px] text-zinc-200 font-bold uppercase tracking-widest mt-1">Welfare & Schemes</p>
                                    </div>
                                    <Button onClick={() => setIsSchemeModalOpen(true)} className="bg-red-600 hover:bg-red-700 h-10 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl">
                                        + Create
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-4 md:p-8">
                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {isLoadingSchemes ? (
                                            <p className="text-center py-12 animate-pulse text-zinc-300 font-black text-[10px] uppercase tracking-widest">Loading Records...</p>
                                        ) : schemesList.filter((s: any) => s.departmentId?._id === department._id).length === 0 ? (
                                            <p className="text-center py-12 text-zinc-200 font-black text-[10px] uppercase tracking-widest">No Active Programs</p>
                                        ) : (
                                            schemesList.filter((s: any) => s.departmentId?._id === department._id).map((s: any) => (
                                                <div key={s._id} className="p-5 bg-black/40 rounded-2xl border border-red-900/10 hover:border-red-500/30 transition-all group">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h5 className="font-black text-white text-sm md:text-base uppercase tracking-tight group-hover:text-red-500 transition-colors">{s.title}</h5>
                                                        <span className="text-[8px] font-black text-emerald-500 bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded uppercase shrink-0">Active</span>
                                                    </div>
                                                    <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed italic">"{s.description}"</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-950/50 border-red-900/20 backdrop-blur-md shadow-2xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
                                <CardHeader className="border-b border-red-900/10 p-6 md:p-8 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-white text-base md:text-lg font-black uppercase tracking-widest">Official News</CardTitle>
                                        <p className="text-[10px] text-zinc-200 font-bold uppercase tracking-widest mt-1">Global Updates</p>
                                    </div>
                                    <Button onClick={() => setIsNewsModalOpen(true)} className="bg-red-600 hover:bg-red-700 h-10 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl">
                                        + Publish
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-4 md:p-8">
                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {isLoadingNews ? (
                                            <p className="text-center py-12 animate-pulse text-zinc-300 font-black text-[10px] uppercase tracking-widest">Fetching Feed...</p>
                                        ) : news.filter((n: any) => n.departmentId?._id === department._id).length === 0 ? (
                                            <p className="text-center py-12 text-zinc-200 font-black text-[10px] uppercase tracking-widest">No Recent Updates</p>
                                        ) : (
                                            news.filter((n: any) => n.departmentId?._id === department._id).map((n: any) => (
                                                <div key={n._id} className="p-5 bg-black/40 rounded-2xl border border-red-900/10 hover:border-red-500/30 transition-all group">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h5 className="font-black text-white text-sm md:text-base uppercase tracking-tight group-hover:text-red-500 transition-colors">{n.title}</h5>
                                                        <span className="text-[8px] font-black text-red-500 bg-red-950/30 border border-red-900/30 px-2 py-0.5 rounded uppercase shrink-0">{n.category}</span>
                                                    </div>
                                                    <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">"{n.content}"</p>
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

            {/* Grievance Detail Modal */}
            <UIDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="w-[95vw] md:max-w-2xl bg-zinc-950 border-red-900/50 text-white shadow-[0_0_50px_rgba(0,0,0,1)] rounded-2xl md:rounded-[2.5rem]">
                    <DialogHeader className="bg-red-950/10 p-6 md:p-10 border-b border-red-900/20 -mx-6 -mt-6 rounded-t-2xl md:rounded-t-[2.5rem]">
                        <DialogTitle className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-tight">{selectedGrievance?.title}</DialogTitle>
                        <div className="flex items-center gap-3 mt-3 md:mt-4">
                            <span className="px-3 py-1 bg-red-600 text-white text-[8px] md:text-[10px] font-black rounded-full uppercase tracking-widest">PRIORITY RECORD</span>
                            <span className="text-red-500 font-bold text-[8px] md:text-[10px] uppercase tracking-widest opacity-60">ID: {selectedGrievance?._id?.slice(-8)}</span>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 md:space-y-8 max-h-[60vh] overflow-y-auto py-6 md:py-8 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 md:p-6 bg-black/40 rounded-2xl border border-red-900/10 shadow-inner">
                                <p className="text-[9px] md:text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-2">Submitted By</p>
                                <p className="font-black text-white text-base md:text-lg mb-1">{selectedGrievance?.raisedBy?.name || 'Anonymous User'}</p>
                                <p className="text-[10px] md:text-xs text-red-500/70 font-bold uppercase tracking-widest">{selectedGrievance?.raisedBy?.email}</p>
                            </div>
                            <div className="p-4 md:p-6 bg-black/40 rounded-2xl border border-red-900/10 shadow-inner">
                                <p className="text-[9px] md:text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-2">Timestamp</p>
                                <p className="font-black text-white text-base md:text-lg mb-1">{new Date(selectedGrievance?.createdAt).toLocaleDateString()}</p>
                                <p className="text-[10px] md:text-xs text-zinc-300 font-bold uppercase tracking-widest">{new Date(selectedGrievance?.createdAt).toLocaleTimeString()}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Case Description</label>
                            <div className="bg-black/60 p-5 md:p-8 rounded-2xl md:rounded-3xl border border-red-900/10 text-zinc-100 text-sm md:text-base leading-relaxed italic shadow-inner">
                                "{selectedGrievance?.description}"
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Official Response</label>
                            <Textarea
                                placeholder="Type the resolution details..."
                                value={resolutionNote}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setResolutionNote(e.target.value)}
                                rows={4}
                                className="bg-black/40 border-red-900/20 text-white placeholder:text-zinc-800 rounded-2xl md:rounded-3xl focus:ring-red-600 p-4 md:p-6 text-sm md:text-base resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex-col md:flex-row gap-3 border-t border-red-900/10 pt-6 md:pt-8">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="w-full md:w-auto text-zinc-300 font-black text-[10px] tracking-widest uppercase hover:text-white">Cancel</Button>
                        <div className="flex gap-3 w-full md:w-auto">
                            <Button 
                                variant="destructive" 
                                onClick={() => handleUpdateStatus('Rejected')} 
                                className="flex-1 md:flex-none bg-zinc-900 hover:bg-red-950 text-red-500 border border-red-900/30 font-black text-[10px] tracking-widest rounded-xl md:rounded-2xl px-6 h-12"
                            >
                                Reject
                            </Button>
                            <Button 
                                className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white font-black text-[10px] tracking-widest rounded-xl md:rounded-2xl px-10 h-12 shadow-[0_10px_30px_rgba(255,0,0,0.3)]" 
                                onClick={() => handleUpdateStatus('Resolved')}
                            >
                                Resolve
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </UIDialog>

            {/* Publishing Modals */}
            <UIDialog open={isNewsModalOpen} onOpenChange={setIsNewsModalOpen}>
                <DialogContent className="w-[95vw] md:max-w-xl bg-zinc-950 border-red-900/50 text-white shadow-[0_0_50px_rgba(0,0,0,1)] rounded-2xl md:rounded-[2.5rem]">
                    <DialogHeader className="bg-red-950/10 p-6 md:p-10 border-b border-red-900/20 -mx-6 -mt-6 rounded-t-2xl md:rounded-t-[2.5rem]">
                        <DialogTitle className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Public Broadcast</DialogTitle>
                        <p className="text-red-500 font-bold text-[8px] md:text-[10px] uppercase tracking-[0.3em] mt-2">Publishing to Global Feed</p>
                    </DialogHeader>
                    <div className="space-y-6 py-6 md:py-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Headline</label>
                            <Input
                                placeholder="Update title..."
                                value={newsTitle}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewsTitle(e.target.value)}
                                className="bg-black/40 border-red-900/20 text-white h-12 md:h-14 rounded-xl md:rounded-2xl focus:ring-red-600 px-4 md:px-6"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Category Tag</label>
                            <select 
                                className="w-full bg-black/40 border border-red-900/20 text-white h-12 md:h-14 rounded-xl md:rounded-2xl px-4 md:px-6 focus:ring-red-600 focus:outline-none font-black text-[10px] md:text-xs uppercase tracking-widest appearance-none"
                                value={newsCategory}
                                onChange={(e) => setNewsCategory(e.target.value)}
                            >
                                <option value="General">General Notice</option>
                                <option value="Alert">Emergency Alert</option>
                                <option value="Update">Policy Update</option>
                                <option value="Holiday">Government Holiday</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Brief Content</label>
                            <Textarea
                                placeholder="Public information..."
                                value={newsContent}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewsContent(e.target.value)}
                                rows={5}
                                className="bg-black/40 border-red-900/20 text-white placeholder:text-zinc-800 rounded-2xl md:rounded-3xl focus:ring-red-600 p-4 md:p-6 text-sm resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex-col md:flex-row gap-3 border-t border-red-900/10 pt-6 md:pt-8">
                        <Button variant="ghost" onClick={() => setIsNewsModalOpen(false)} className="text-zinc-300 font-black text-[10px] tracking-widest uppercase">Discard</Button>
                        <Button 
                            onClick={handleCreateNews}
                            className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] tracking-widest rounded-xl md:rounded-2xl px-10 h-12 md:h-14 shadow-lg w-full md:w-auto"
                        >
                            Publish Feed
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </UIDialog>

            <UIDialog open={isSchemeModalOpen} onOpenChange={setIsSchemeModalOpen}>
                <DialogContent className="w-[95vw] md:max-w-xl bg-zinc-950 border-red-900/50 text-white shadow-[0_0_50px_rgba(0,0,0,1)] rounded-2xl md:rounded-[2.5rem]">
                    <DialogHeader className="bg-red-950/10 p-6 md:p-10 border-b border-red-900/20 -mx-6 -mt-6 rounded-t-2xl md:rounded-t-[2.5rem]">
                        <DialogTitle className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">New Initiative</DialogTitle>
                        <p className="text-red-500 font-bold text-[8px] md:text-[10px] uppercase tracking-[0.3em] mt-2">Developing Citizen Welfare</p>
                    </DialogHeader>
                    <div className="space-y-6 py-6 md:py-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Program Name</label>
                            <Input
                                placeholder="Official name..."
                                value={newSchemeTitle}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewSchemeTitle(e.target.value)}
                                className="bg-black/40 border-red-900/20 text-white h-12 md:h-14 rounded-xl md:rounded-2xl focus:ring-red-600 px-4 md:px-6"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Program Scope</label>
                            <Textarea
                                placeholder="Describe the objectives..."
                                value={newSchemeDesc}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewSchemeDesc(e.target.value)}
                                rows={6}
                                className="bg-black/40 border-red-900/20 text-white placeholder:text-zinc-800 rounded-2xl md:rounded-3xl focus:ring-red-600 p-4 md:p-6 text-sm resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex-col md:flex-row gap-3 border-t border-red-900/10 pt-6 md:pt-8">
                        <Button variant="ghost" onClick={() => setIsSchemeModalOpen(false)} className="text-zinc-300 font-black text-[10px] tracking-widest uppercase">Discard</Button>
                        <Button 
                            onClick={handleCreateScheme}
                            className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] tracking-widest rounded-xl md:rounded-2xl px-10 h-12 md:h-14 shadow-lg w-full md:w-auto"
                        >
                            Deploy Program
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </UIDialog>
        </div>
    );
}
